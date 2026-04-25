export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { rateLimitAsync, RATE_LIMITS } from '@/lib/rate-limit';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-12-18.acacia' as any,
});

/**
 * POST /api/payments/checkout
 * 
 * Creates a Stripe Checkout Session for an application.
 * 
 * SESSION EXPIRY HANDLING:
 * Stripe sessions expire by default after 24 hours.
 * This endpoint:
 * 1. Validates application ownership and payment status
 * 2. Creates a new Stripe session
 * 3. Stores session ID in DB
 * 4. Checks if returned session is still valid
 * 5. Returns URL or clear error with retry-safe guidance
 * 
 * If session is expired/unusable, returns 410 Gone with:
 * - code: SESSION_EXPIRED
 * - message: User-friendly explanation
 * - action: "retry" - user can safely retry, existing state is preserved
 */
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Rate limiting: 10 checkout attempts per 15 minutes per user
    const rl = await rateLimitAsync(`checkout:${currentUser.userId}`, { maxRequests: 10, windowMs: 15 * 60 * 1000 });
    if (!rl.allowed) {
      return NextResponse.json(
        { error: 'Too many checkout attempts. Please wait before trying again.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const { applicationId, promoCode } = body;
    if (!applicationId) {
      return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
    }

    const application = await db.application.findFirst({
      where: { id: applicationId, deletedAt: null },
      include: { service: true, payment: true },
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    if (application.userId !== currentUser.userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if already paid (idempotent check)
    if (application.payment && application.payment.status === 'SUCCEEDED') {
      return NextResponse.json({ error: 'Application already paid' }, { status: 400 });
    }

    // Ensure service is selected before payment
    if (!application.service) {
      return NextResponse.json({ error: 'Please select a service before proceeding to payment' }, { status: 400 });
    }

    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host');
    const baseUrl = `${protocol}://${host}`;

    // Calculate price with optional promo code discount
    let finalPrice = Number(application.service.price);
    let discount = 0;
    let promoCodeId: string | null = null;
    let promoMaxUses: number | null = null;

    if (promoCode) {
      const promo = await db.promoCode.findUnique({ where: { code: promoCode.toUpperCase() } });
      if (promo && promo.isActive) {
        const notExpired = !promo.expiresAt || new Date() <= promo.expiresAt;
        const notMaxed = !promo.maxUses || promo.currentUses < promo.maxUses;
        if (notExpired && notMaxed) {
          if (promo.type === 'PERCENTAGE') {
            discount = Math.round((finalPrice * Number(promo.value)) / 100 * 100) / 100;
          } else {
            discount = Math.min(Number(promo.value), finalPrice);
          }
          finalPrice = Math.max(0, finalPrice - discount);
          promoCodeId = promo.id;
          promoMaxUses = promo.maxUses ?? null;
          // NOTE: Promo code usage is incremented in the webhook handler
          // on successful payment, NOT here. This prevents wasted uses
          // when checkout sessions are abandoned.
        }
      }
    }

    // Handle free orders (e.g., 100% promo code discount) without calling Stripe
    // Stripe rejects unit_amount: 0 in payment mode
    if (finalPrice <= 0) {
      // Track promo code usage atomically
      if (promoCodeId) {
        const updated = await db.promoCode.updateMany({
          where: {
            id: promoCodeId,
            OR: [
              { maxUses: null },
              { maxUses: { gt: db.promoCode.fields.currentUses } }
            ]
          },
          data: { currentUses: { increment: 1 } }
        })
        if (updated.count === 0) {
          return NextResponse.json(
            { error: 'Promo code has reached its usage limit.' },
            { status: 400 }
          )
        }
      }

      // Mark application as payment succeeded directly
      await db.application.update({
        where: { id: applicationId },
        data: { status: 'SUBMITTED' },
      });

      // Create or update payment record as succeeded
      if (application.payment) {
        await db.payment.update({
          where: { id: application.payment.id },
          data: {
            amount: 0,
            discount: discount > 0 ? discount : null,
            promoCodeId,
            status: 'SUCCEEDED',
            paidAt: new Date(),
          },
        });
      } else {
        await db.payment.create({
          data: {
            userId: currentUser.userId,
            applicationId: application.id,
            amount: 0,
            discount: discount > 0 ? discount : null,
            promoCodeId,
            currency: 'usd',
            status: 'SUCCEEDED',
            paidAt: new Date(),
          },
        });
      }

      return NextResponse.json({ free: true });
    }

    const unitAmount = Math.round(finalPrice * 100); // Stripe expects cents

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Okinte Application: ${application.service?.key?.toUpperCase() || 'SERVICE'}`,
              description: `Application Reference: ${application.referenceCode}${discount > 0 ? ` (Discount: $${discount})` : ''}`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/en/dashboard?session_id={CHECKOUT_SESSION_ID}&success=true&app=${applicationId}`,
      cancel_url: `${baseUrl}/en/dashboard?canceled=true&app=${applicationId}`,
      client_reference_id: applicationId,
      customer_email: currentUser.email,
      metadata: {
        applicationId: application.id,
        userId: currentUser.userId,
      },
      // Stripe sessions expire after 24 hours by default
      // We can explicitly set expires_at for better control
      expires_at: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiry for tighter control
    });

    // Create or Update Payment record in DB
    if (application.payment) {
      await db.payment.update({
        where: { id: application.payment.id },
        data: {
          stripeSessionId: session.id,
          amount: finalPrice,
          discount: discount > 0 ? discount : null,
          promoCodeId,
          status: 'PENDING',
        },
      });
    } else {
      try {
        await db.payment.create({
          data: {
            userId: currentUser.userId,
            applicationId: application.id,
            stripeSessionId: session.id,
            amount: finalPrice,
            discount: discount > 0 ? discount : null,
            promoCodeId,
            currency: 'usd',
            status: 'PENDING',
          },
        });
      } catch (e: any) {
        if (e.code === 'P2002') {
          // A concurrent request won the race and created the payment record.
          // Fallback to update so we don't crash.
          console.warn('Concurrent checkout detected, falling back to update for app:', application.id);
          await db.payment.updateMany({
            where: { applicationId: application.id },
            data: {
              stripeSessionId: session.id,
              amount: finalPrice,
              discount: discount > 0 ? discount : null,
              promoCodeId,
              status: 'PENDING',
            },
          });
        } else {
          throw e;
        }
      }
    }

    // Validate session is usable before returning URL
    // Stripe returns null URL if session is expired
    if (!session.url) {
      // Session was created but is immediately expired
      // This can happen if expires_at is in the past
      console.error('Stripe returned null URL for session:', session.id);
      return NextResponse.json({
        error: 'Payment session could not be created. Please try again.',
        code: 'SESSION_CREATION_FAILED',
        retryable: true,
      }, { status: 503 });
    }

    // Check if session is already expired (Stripe may return URL but it won't work)
    const sessionAge = Date.now() - (session.created ? session.created * 1000 : 0);
    const sessionExpiryBuffer = 5 * 60 * 1000; // 5 minutes buffer
    const sessionExpectedLifetime = 60 * 60 * 1000; // 1 hour (our explicit expiry)

    if (sessionAge + sessionExpiryBuffer > sessionExpectedLifetime) {
      // Session is essentially expired or about to expire
      // Return retry-safe error
      return NextResponse.json({
        error: 'Payment session expired. Please start a new checkout.',
        code: 'SESSION_EXPIRED',
        retryable: true,
      }, { status: 410 });
    }

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
      expiresAt: session.expires_at ? new Date(session.expires_at * 1000).toISOString() : null,
    });

  } catch (error: unknown) {
    console.error('Checkout error:', error);

    // Check for Stripe-specific errors
    if (error instanceof Error && error.message.includes('Stripe')) {
      // Stripe API error - likely retryable
      return NextResponse.json(
        {
          error: 'Payment service temporarily unavailable. Please try again.',
          code: 'STRIPE_ERROR',
          retryable: true,
        },
        { status: 503 }
      );
    }

    // Never leak internal error details to the client
    return NextResponse.json(
      { error: 'Unable to initialize payment. Please try again or contact support.' },
      { status: 500 }
    );
  }
}
