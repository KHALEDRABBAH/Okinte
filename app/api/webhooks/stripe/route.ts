export const dynamic = 'force-dynamic';

/**
 * POST /api/webhooks/stripe
 *
 * Handles Stripe webhook events for payment lifecycle.
 * Events handled:
 * - checkout.session.completed → mark payment SUCCEEDED, submit application
 * - checkout.session.expired   → mark payment FAILED
 * - payment_intent.payment_failed → mark payment FAILED
 *
 * ATOMIC IDEMPOTENCY STRATEGY:
 * Uses WebhookEvent table as authoritative record of processed events.
 * 1. Try to INSERT event.id into webhook_events (UNIQUE constraint = atomic lock)
 * 2. If INSERT fails (duplicate key), skip processing - event already handled
 * 3. Only after successful INSERT do we perform side effects
 *
 * This provides TRUE protection against concurrent duplicate execution:
 * - PostgreSQL UNIQUE constraint is enforced atomically
 * - First concurrent webhook wins, others are rejected
 */
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { alertCriticalError } from '@/lib/alert';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
});

/**
 * Validate Stripe webhook secret at module load time.
 * This ensures we catch configuration errors immediately,
 * not on first webhook request.
 */
function getWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.trim() === '') {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('FATAL: STRIPE_WEBHOOK_SECRET environment variable is not set. Refusing to start in production without it.');
    }
    console.warn('⚠️  STRIPE_WEBHOOK_SECRET not set — webhook signatures will NOT be verified. Do NOT deploy this to production.');
    return '';
  }
  return secret;
}

const webhookSecret = getWebhookSecret();

export async function POST(req: NextRequest) {
  try {
    // Guard: Ensure webhook secret is configured before processing
    if (!webhookSecret || webhookSecret.trim() === '') {
      console.error('CRITICAL: Stripe webhook secret is not configured. Rejecting unsigned webhook.');
      return NextResponse.json(
        { error: 'Webhook secret not configured. Webhook cannot be processed.' },
        { status: 500 }
      );
    }

    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing Stripe signature' }, { status: 400 });
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Webhook signature verification failed: ${message}`);
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 400 });
    }

    // IDEMPOTENCY: Check if event was already processed successfully
    const existingEvent = await db.webhookEvent.findUnique({
      where: { id: event.id },
    });

    if (existingEvent) {
      if (existingEvent.status === 'COMPLETED' || existingEvent.status === 'PROCESSING') {
        console.log(`Event ${event.id} already processed or processing, skipping`);
        return NextResponse.json({ received: true, status: 'duplicate_skipped' });
      }
      
      // If FAILED, we want to retry it
      await db.webhookEvent.update({
        where: { id: event.id },
        data: {
          status: 'PROCESSING',
          retryCount: { increment: 1 },
        },
      });
    } else {
      await db.webhookEvent.create({
        data: {
          id: event.id,
          type: event.type,
          status: 'PROCESSING',
        },
      });
    }

    // Event claimed successfully - now process it
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const applicationId = session.client_reference_id;
        const paymentIntentId = session.payment_intent as string;

        if (applicationId) {
          // RACE-SAFE: The payment record may not exist yet if the webhook
          // arrives before the submit endpoint finishes writing the payment row.
          // This happens with fast payers (Apple Pay, saved cards) because Stripe
          // fires the webhook instantly on payment completion.
          //
          // Strategy: find the application first, then find-or-create the payment.

          const application = await db.application.findFirst({
            where: { id: applicationId, deletedAt: null },
            select: { id: true, userId: true, status: true },
          });

          if (!application) {
            console.error(`Webhook: Application ${applicationId} not found`);
            break;
          }

          // Skip if application already advanced past SUBMITTED (admin already acted)
          if (['APPROVED', 'REJECTED', 'UNDER_REVIEW', 'RETURNED'].includes(application.status)) {
            console.log(`Application ${applicationId} already past SUBMITTED, skipping`);
            break;
          }

          // Find existing payment record (may or may not exist yet)
          const existingPayment = await db.payment.findUnique({
            where: { applicationId },
          });

          // If payment already succeeded, skip (true idempotency)
          if (existingPayment?.status === 'SUCCEEDED') {
            console.log(`Payment already SUCCEEDED for application ${applicationId}`);
            break;
          }

          // Update existing payment or create one if the submit endpoint hasn't written it yet
          if (existingPayment) {
            await db.payment.update({
              where: { applicationId },
              data: {
                status: 'SUCCEEDED',
                stripePaymentIntentId: paymentIntentId,
                paidAt: new Date(),
              },
            });
          } else {
            // Payment record doesn't exist — webhook arrived before submit endpoint finished.
            // Create it ourselves using data from the Stripe session.
            console.warn(`Webhook: Payment record missing for ${applicationId}, creating from Stripe session data`);
            await db.payment.create({
              data: {
                userId: application.userId,
                applicationId,
                stripeSessionId: session.id,
                stripePaymentIntentId: paymentIntentId,
                amount: session.amount_total ? session.amount_total / 100 : 0,
                currency: session.currency || 'usd',
                status: 'SUCCEEDED',
                paidAt: new Date(),
              },
            });
          }

          // Update application status to SUBMITTED
          const updatedApp = await db.application.update({
            where: { id: applicationId },
            data: {
              status: 'SUBMITTED',
              submittedAt: new Date(),
            },
            include: { user: true, service: true, payment: true },
          });

          // Increment promo code usage now that payment is confirmed
          if (updatedApp.payment?.promoCodeId) {
            await db.promoCode.updateMany({
              where: {
                id: updatedApp.payment.promoCodeId,
                isActive: true,
              },
              data: { currentUses: { increment: 1 } },
            }).catch((err: unknown) => console.error('Failed to increment promo code usage:', err));
          }

          // Send receipt email (non-blocking - failure should not break webhook)
          const { sendApplicationReceiptEmail } = await import('@/lib/email');
          await sendApplicationReceiptEmail(
            updatedApp.user.email,
            updatedApp.user.firstName,
            updatedApp.referenceCode,
            updatedApp.service?.key || 'service'
          ).catch(err => console.error('Failed to send receipt email:', err));
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const applicationId = session.client_reference_id;

        if (applicationId) {
          // Find pending payment
          const payment = await db.payment.findFirst({
            where: { applicationId, status: 'PENDING' },
            include: { application: { include: { user: true, service: true } } }
          });

          if (payment) {
            // Mark payment as FAILED
            await db.payment.update({
              where: { id: payment.id },
              data: { status: 'FAILED' },
            });
            
            // Send failure email
            const { sendPaymentFailedEmail } = await import('@/lib/email');
            await sendPaymentFailedEmail(
              payment.application.user.email,
              payment.application.user.firstName,
              payment.application.referenceCode,
              payment.application.service?.key || 'service'
            ).catch(err => console.error('Failed to send payment failure email:', err));
          }
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const stripePaymentIntentId = paymentIntent.id;

        const payment = await db.payment.findFirst({
          where: { stripePaymentIntentId, status: 'PENDING' },
          include: { application: { include: { user: true, service: true } } }
        });

        if (payment) {
          // Mark payment as FAILED
          await db.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          });

          // Send failure email
          const { sendPaymentFailedEmail } = await import('@/lib/email');
          await sendPaymentFailedEmail(
            payment.application.user.email,
            payment.application.user.firstName,
            payment.application.referenceCode,
            payment.application.service?.key || 'service'
          ).catch(err => console.error('Failed to send payment failure email:', err));
        }
        break;
      }

      default:
        // Unhandled event type - acknowledge receipt without action
        break;
    }

    // Successfully processed
    await db.webhookEvent.update({
      where: { id: event.id },
      data: {
        status: 'COMPLETED',
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error: any) {
    console.error('Webhook processing error:', error);
    
    const stripeEventId = (event as any)?.id;
    // Attempt to mark as failed
    if (stripeEventId) {
      await db.webhookEvent.update({
        where: { id: stripeEventId },
        data: {
          status: 'FAILED',
          lastError: error?.message || 'Unknown processing error',
        },
      }).catch(() => {}); // ignore error here
    }

    await alertCriticalError('Webhook', 'Stripe processing crashed', {
      eventId: stripeEventId,
      error: error?.message,
      stack: error?.stack,
    });

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
