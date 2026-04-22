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

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(req: NextRequest) {
  try {
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

    // ATOMIC IDEMPOTENCY: Try to claim this event first
    // The INSERT will fail if event.id already exists (unique constraint)
    // This is the key to preventing concurrent duplicate processing
    try {
      await db.webhookEvent.create({
        data: {
          id: event.id,
          type: event.type,
        },
      });
    } catch (err: unknown) {
      // P2002 = Prisma unique constraint violation = duplicate event
      // Prisma errors have a `code` property: err.code === 'P2002'
      // Check both for safety
      const errorCode = (err as any)?.code;
      if (errorCode === 'P2002' || (err instanceof Error && err.message.includes('P2002'))) {
        console.log(`Event ${event.id} already processed, skipping duplicate`);
        return NextResponse.json({ received: true, status: 'duplicate_skipped' });
      }
      // Re-throw unexpected errors
      throw err;
    }

    // Event claimed successfully - now process it
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const applicationId = session.client_reference_id;
        const paymentIntentId = session.payment_intent as string;

        if (applicationId) {
          // Update payment to SUCCEEDED (only if not already succeeded)
          const paymentUpdateResult = await db.payment.updateMany({
            where: {
              applicationId,
              status: { not: 'SUCCEEDED' },
            },
            data: {
              status: 'SUCCEEDED',
              stripePaymentIntentId: paymentIntentId,
              paidAt: new Date(),
            },
          });

          if (paymentUpdateResult.count === 0) {
            console.log(`Payment already processed for application ${applicationId}`);
            break;
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
            updatedApp.service.key
          ).catch(err => console.error('Failed to send receipt email:', err));
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data.object as Stripe.Checkout.Session;
        const applicationId = session.client_reference_id;

        if (applicationId) {
          // Mark payment as FAILED (only if currently pending)
          await db.payment.updateMany({
            where: {
              applicationId,
              status: 'PENDING',
            },
            data: { status: 'FAILED' },
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const stripePaymentIntentId = paymentIntent.id;

        // Mark payment as FAILED (only if currently pending)
        await db.payment.updateMany({
          where: {
            stripePaymentIntentId,
            status: 'PENDING',
          },
          data: { status: 'FAILED' },
        });
        break;
      }

      default:
        // Unhandled event type - acknowledge receipt without action
        break;
    }

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
