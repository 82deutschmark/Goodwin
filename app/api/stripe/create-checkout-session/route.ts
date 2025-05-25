/**
 * API Route: /api/stripe/create-checkout-session
 *
 * Initiates a Stripe Checkout session for purchasing credits.
 * - Authenticates the user.
 * - Accepts a Stripe priceId (for the credit package).
 * - Creates a Stripe Checkout Session with the user's info and selected price.
 * - Returns the sessionId for Stripe.js redirect.
 *
 * Logic:
 * 1. Authenticate the user and reject if not logged in.
 * 2. Accept a JSON body with priceId.
 * 3. Create a Stripe Checkout session with client_reference_id (userId), customer_email, success_url, cancel_url, and the correct priceId.
 * 4. Return the sessionId for client-side redirect.
 *
 * Author: gpt-4.1-nano-2025-04-14 | 2025-05-25
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from 'next-auth/next';

const stripe = new Stripe(String(process.env.STRIPE_SECRET_KEY), {
  apiVersion: '2024-06-20',
});

/**
 * Creates a Stripe Checkout session for purchasing credits.
 *
 * @param req - The NextRequest object.
 * @returns A NextResponse object with the sessionId for client-side redirect.
 */
export async function POST(req: NextRequest) {
  // Authenticate the user
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse JSON body for priceId
  const { priceId } = await req.json();

  // Create a Stripe Checkout session
  try {
    // Stripe Checkout session creation (no client_reference_id if not in API)
    // Build Stripe Checkout session params with only defined, valid fields
    const checkoutSessionParams: Stripe.Checkout.SessionCreateParams = {
      success_url: `${process.env.NEXTAUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXTAUTH_URL}/checkout/cancel`,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'payment',
    };
    // Add customer_email if available
    if (typeof session.user.email === 'string' && session.user.email.length > 0) {
      checkoutSessionParams.customer_email = session.user.email;
    }
    // Add client_reference_id if available
    if (typeof session.user.id === 'string' && session.user.id.length > 0) {
      checkoutSessionParams.client_reference_id = session.user.id;
    }
    // Create the Stripe Checkout session
    const checkoutSession = await stripe.checkout.sessions.create(checkoutSessionParams);


    // Return the sessionId for client-side redirect
    return NextResponse.json({ sessionId: checkoutSession.id }, { status: 201 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || 'Failed to create Checkout session' }, { status: 500 });
  }
}
