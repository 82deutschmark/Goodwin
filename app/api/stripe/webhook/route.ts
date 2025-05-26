/**
 * API Route: /api/stripe/webhook
 *
 * Handles Stripe webhook events securely for credit purchases and refunds.
 * - Verifies Stripe webhook signature using STRIPE_WEBHOOK_SECRET from .env.
 * - Handles checkout.session.completed (credit purchase) and charge.refunded (refund) events.
 * - On purchase: awards credits/bonuses, creates CreditPurchase, increments user.credits (idempotent).
 * - On refund: creates CreditAdjustment, decrements user.credits accordingly.
 * - All DB ops via Prisma. Logs and returns 200 for handled events, 400 for signature errors, 500 for unhandled errors.
 * - Modular, secure, production-ready. No secrets in logs or responses.
 *
 * Author: Cascade (gpt-4.1-nano-2025-04-14)
 * Last updated: 2025-05-25
 * Notes: Removed unused variables flagged by ESLint. Lint-free.
 *
 * Usage: Maintainers should review Stripe product/price IDs in .env and keep logic in sync with credit packages.
 */

import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { prisma } from '@/lib/prisma';

// This is needed to get the raw body for Stripe webhook verification
export const dynamic = 'force-dynamic'; // Ensure this route is dynamic

// Initialize Stripe with the latest API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { 
  apiVersion: '2024-06-20' 
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

// Stripe initialization and webhook secret are already defined above

// Credit package mapping (sync with .env and docs)
const CREDIT_PACKAGES: Record<string, { credits: number; bonus: number; total: number; productId: string; priceId: string; amount: number }> = {
  [process.env.STRIPE_PRICE_ID_1000!]: { credits: 1000, bonus: 0, total: 1000, productId: process.env.STRIPE_PRODUCT_ID_1000!, priceId: process.env.STRIPE_PRICE_ID_1000!, amount: 100 },
  [process.env.STRIPE_PRICE_ID_5050!]: { credits: 5000, bonus: 50, total: 5050, productId: process.env.STRIPE_PRODUCT_ID_5050!, priceId: process.env.STRIPE_PRICE_ID_5050!, amount: 500 },
  [process.env.STRIPE_PRICE_ID_11000!]: { credits: 10000, bonus: 1000, total: 11000, productId: process.env.STRIPE_PRODUCT_ID_11000!, priceId: process.env.STRIPE_PRICE_ID_11000!, amount: 1000 },
  [process.env.STRIPE_PRICE_ID_23000!]: { credits: 20000, bonus: 3000, total: 23000, productId: process.env.STRIPE_PRODUCT_ID_23000!, priceId: process.env.STRIPE_PRICE_ID_23000!, amount: 2000 },
  [process.env.STRIPE_PRICE_ID_62500!]: { credits: 50000, bonus: 12500, total: 62500, productId: process.env.STRIPE_PRODUCT_ID_62500!, priceId: process.env.STRIPE_PRICE_ID_62500!, amount: 5000 },
  [process.env.STRIPE_PRICE_ID_140000!]: { credits: 100000, bonus: 40000, total: 140000, productId: process.env.STRIPE_PRODUCT_ID_140000!, priceId: process.env.STRIPE_PRICE_ID_140000!, amount: 10000 },
};

export async function POST(request: Request) {
  // Get the raw body as text
  const body = await request.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');
  
  if (!signature) {
    return new NextResponse('No signature', { status: 400 });
  }

  let event;
  
  try {
    // Verify the webhook signature
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('⚠️  Webhook signature verification failed:', err.message);
    return new NextResponse(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }), 
      { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        // Handle checkout session completed
        const customerEmail = typeof session.customer_details?.email === 'string' ? session.customer_details.email : undefined;
        const paymentIntentId = typeof session.payment_intent === 'string' ? session.payment_intent : undefined;
        
        // Find the purchased price ID
        let purchasedPriceId: string | undefined = undefined;
        if (session.metadata && typeof session.metadata.price_id === 'string') {
          purchasedPriceId = session.metadata.price_id;
        } else if (session.mode === 'payment' && typeof session.amount_total === 'number') {
          // Try to map by amount
          purchasedPriceId = Object.keys(CREDIT_PACKAGES).find(
            (pid) => CREDIT_PACKAGES[pid].amount === session.amount_total! / 100
          );
        }
        
        if (!purchasedPriceId || !CREDIT_PACKAGES[purchasedPriceId]) {
          console.error('Unknown or missing price ID for credit package purchase.');
          break;
        }
        
        // Idempotency: check if already processed
        if (!paymentIntentId) {
          console.error('Missing paymentIntentId in session');
          break;
        }
        
        const existing = await prisma.creditPurchase.findUnique({ where: { stripePaymentIntentId: paymentIntentId } });
        if (existing) {
          console.log('Credit purchase already processed for paymentIntent:', paymentIntentId);
          break;
        }
        
        // Find user by email
        if (!customerEmail) {
          console.error('Missing customer email in session');
          break;
        }
        
        const user = await prisma.user.findUnique({ where: { email: customerEmail } });
        if (!user) {
          console.error('User not found for Stripe customer email:', customerEmail);
          break;
        }
        
        // Award credits
        const { total } = CREDIT_PACKAGES[purchasedPriceId];
        await prisma.$transaction([
          prisma.creditPurchase.create({
            data: {
              userId: user.id,
              stripePaymentIntentId: paymentIntentId,
              creditsPurchased: total,
              amountPaid: typeof session.amount_total === 'number' ? session.amount_total : 0,
              currency: typeof session.currency === 'string' ? session.currency : 'usd',
            },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { credits: { increment: total } },
          }),
        ]);
        
        console.log(`Awarded ${total} credits to user ${user.email} for paymentIntent ${paymentIntentId}`);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        const paymentIntentId = charge.payment_intent as string;
        
        // Find the purchase record
        const purchase = await prisma.creditPurchase.findUnique({ 
          where: { stripePaymentIntentId: paymentIntentId } 
        });
        
        if (!purchase) {
          console.error('No matching CreditPurchase for refund:', paymentIntentId);
          break;
        }
        
        // Find user
        const user = await prisma.user.findUnique({ 
          where: { id: purchase.userId } 
        });
        
        if (!user) {
          console.error('User not found for refund:', purchase.userId);
          break;
        }
        
        // Decrement credits and log adjustment
        await prisma.$transaction([
          prisma.creditAdjustment.create({
            data: {
              userId: user.id,
              amount: -purchase.creditsPurchased,
              reason: `Refund for Stripe paymentIntent ${paymentIntentId}`,
            },
          }),
          prisma.user.update({
            where: { id: user.id },
            data: { credits: { decrement: purchase.creditsPurchased } },
          }),
        ]);
        
        console.log(`Refunded ${purchase.creditsPurchased} credits from user ${user.email} for paymentIntent ${paymentIntentId}`);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new NextResponse(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err) {
    console.error('Webhook error:', err);
    return new NextResponse(
      JSON.stringify({ 
        error: err instanceof Error ? err.message : 'Unknown error' 
      }), 
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}
