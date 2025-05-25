# Plan: Credits System and Stripe Integration

**Progress Update [2025-05-25]:**
- ✅ Stripe credits backend complete and lint-free
- ✅ Database schema implemented with User, CreditPurchase, CreditSpend, and CreditAdjustment models
- ✅ NextAuth integration with credits attached to session
- ✅ Award 500 credits to new users on signup
- ✅ Credit balance refresh endpoint implemented (`/api/user/credits`)
- ✅ Stripe Checkout session endpoint implemented (`/api/stripe/create-checkout-session`)
- ✅ Stripe webhook endpoint implemented with proper signature verification and idempotency checks
- ✅ Frontend components completed: BuyCreditsButton component, /buy-credits page, /checkout/success and /checkout/cancel pages
- ⏳ Credit consumption logic needs to be integrated into features 
- ⏳ Session refresh mechanism after purchase could be improved

**Author:** Claude 3.5 Sonnet (updating progress tracking)  
**Original Author:** gpt-4.1-nano-2025-04-14  
**Date:** 2025-05-25

## 1. Overview

This plan outlines the steps to integrate a user credit system and Stripe payments into the OpenAI Responses Starter App. Users will be able to purchase credits via Stripe and spend these credits on application features (e.g., image generation).

## 2. Prerequisites

*   Existing Google OAuth setup with NextAuth.
*   A Stripe account.
*   Stripe Products (e.g., "100 Credits", "500 Credits") created in the Stripe Dashboard.
*   Stripe API Keys (Publishable Key, Secret Key) and Webhook Secret.
*   Decision on a database solution.

## 3. Phases and Tasks

### Phase 1: User and Credit Management (Database & Auth)

*   **Task 1.1: Database Setup**
    *   [x] Choose and configure a database (e.g., PostgreSQL with Prisma, Supabase, Vercel Postgres, Neon). **Note:** Ensure the chosen solution/ORM provides effective connection pooling for serverless environments (See Pitfall #6).
    *   [x] Define `User` schema: `id` (PK), `googleId` (unique), `email` (unique), `name`, `credits` (integer, default: 0, serves as a denormalized balance).
    *   [x] Define `CreditPurchase` schema: `id` (PK), `userId` (FK to User), `stripePaymentIntentId` (unique, for idempotency), `creditsPurchased`, `amountPaid`, `currency`, `timestamp`.
    *   [x] Define `CreditSpend` schema: `id` (PK), `userId` (FK to User), `featureUsed` (e.g., 'imageGeneration'), `creditsSpent`, `timestamp`.
    *   [x] (Optional) Define `CreditAdjustment` schema for manual adjustments, refunds: `id` (PK), `userId` (FK to User), `amount` (can be negative), `reason`, `adminUserId`, `timestamp`.
    *   [x] Set up database connection and ORM/client (e.g., Prisma).
*   **Task 1.2: NextAuth Modification**
    *   [x] Install NextAuth adapter for the chosen database (e.g., `@next-auth/prisma-adapter`) or implement custom callbacks.
    *   [x] Update `app/api/auth/[...nextauth]/route.ts`:
        *   Configure the adapter.
        *   Modify `callbacks` (e.g., `session`, `jwt`) to:
            *   On sign-in/session creation, find or create the user in the database.
            *   Include `userId` (from your DB) and current `credits` (fetched from DB) in the session object. **Note:** This session `credits` value is for UI display and can be stale (See Pitfall #2, #5).
            *   [x] Attach `session.user.credits` in NextAuth callback.
*   **Task 1.3: API Endpoint for Credits**
    *   [x] Create `app/api/user/credits/route.ts`:
        *   `GET` method to return the current logged-in user's latest credit balance, fetched directly from the database.
*   **Task 1.4: Award 500 Credits to New Users on Signup**
    *   [x] Implement a callback in NextAuth to award 500 credits to new users upon successful signup. **Timestamp:** 2025-05-25. **Author:** gpt-4.1-nano-2025-04-14.

### Phase 2: Stripe Integration for Purchasing Credits

*   **Task 2.1: Stripe Setup & Configuration**
    *   ✅ Install Stripe Node.js library: `npm install stripe`.
    *   ✅ Add Stripe keys to `.env`: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`.
    *   ✅ Set up Stripe webhook in the Stripe Dashboard.
*   **Task 2.2: API Endpoint - Create Checkout Session**
    *   ✅ Create `app/api/stripe/create-checkout-session/route.ts`. **Note:** Ensures this route runs on the Node.js runtime.
        *   ✅ `POST` method that accepts a Stripe `priceId`.
        *   ✅ Authenticates the user (ensures they are logged in).
        *   ✅ Uses the Stripe SDK to create a Checkout Session.
            *   ✅ Include `client_reference_id` (internal `userId`) in session metadata to link the Stripe payment to the user.
            *   ✅ Set `success_url` and `cancel_url`.
            *   ✅ Pass `customer_email` to prefill Stripe checkout.
        *   ✅ Returns the Stripe `sessionId` to the client. **Timestamp:** 2025-05-25. **Author:** gpt-4.1-nano-2025-04-14. **Note:** Using Stripe API version 2024-06-20, compatible with Next.js 13+.
*   **Task 2.3: API Endpoint - Stripe Webhook**
    *   ✅ Create `app/api/stripe/webhook/route.ts`. **Note:** Ensures this route runs on the Node.js runtime.
        *   ✅ `POST` method to receive webhooks from Stripe.
        *   ✅ Verify the Stripe webhook signature using `STRIPE_WEBHOOK_SECRET`.
        *   ✅ Handle `checkout.session.completed` event:
            *   ✅ **Idempotency Check:** Verify `event.data.object.payment_intent` hasn't been processed by checking `CreditPurchase` table.
            *   ✅ Retrieve `userId` from `event.data.object.client_reference_id`.
            *   ✅ Retrieve purchased credits amount from the credit packages mapping based on priceId.
            *   ✅ Atomically update the user's `credits` in the database and record in `CreditPurchase` table within a transaction.
        *   ✅ Handle `charge.refunded` event for automated refund processing:
            *   ✅ Retrieve `userId` (by looking up via `payment_intent_id`).
            *   ✅ Deduct credits and record in `CreditAdjustment` table.
        *   ✅ Return a 200 OK response to Stripe.
*   **Task 2.4: Frontend for Purchasing Credits**
    *   ✅ Create `components/BuyCreditsButton.tsx` component for initiating Stripe checkout.
    *   ✅ Create `app/buy-credits/page.tsx` to display credit packages and purchase options.
        *   ✅ Display available credit packages with prices.
        *   ✅ On button click, call `/api/stripe/create-checkout-session` with the selected `priceId`.
        *   ✅ Redirect to Stripe Checkout using the `sessionId`.
    *   ✅ Create `app/checkout/success/page.tsx` for successful payments.
    *   ✅ Create `app/checkout/cancel/page.tsx` for cancelled payments.
*   **Task 2.5: Session Refresh After Purchase**
    *   ⏳ Implement a more robust mechanism to refresh the user's session after a successful purchase, updating their `credits` value. Currently only basic refresh functionality is implemented.

### Phase 3: Consuming Credits

*   **Task 3.1: Modify Feature Endpoints**
    *   ⏳ Identify API endpoints that will consume credits (e.g., `app/api/image-generator/route.ts`).
    *   ⏳ In each endpoint:
        *   Get the current user's `userId` from the session.
        *   **Crucial:** Within a database transaction:
            *   Fetch the user's *current* `credits` directly from the database (do not rely solely on session `credits`).
            *   Before processing, check if `user_db_credits >= cost_of_action`.
            *   If insufficient credits, return an appropriate error (e.g., 402 Payment Required).
            *   After successful action, deduct credits: `UPDATE User SET credits = credits - cost_of_action WHERE id = userId` AND record in `CreditSpend` table.
*   **Task 3.2: Frontend Updates**
    *   ✅ Display user's current credit balance in the UI on the buy-credits page by fetching from `/api/user/credits`.
    *   ✅ No credit cost shown for actions as per requirements.
    *   ⏳ Provide feedback on insufficient credits in premium features.
    *   ⏳ Ensure credit balance updates in the UI after consumption (may require re-fetching from `/api/user/credits`).

## 4. File Manifest

**Files Created (✅):**

*   ✅ `lib/prisma.ts` - Prisma client configuration
*   ✅ `prisma/schema.prisma` - Database schema with User, CreditPurchase, CreditSpend, and CreditAdjustment models
*   ✅ `app/api/user/credits/route.ts` - API endpoint to fetch user's current credit balance
*   ✅ `app/api/stripe/create-checkout-session/route.ts` - API endpoint to create Stripe checkout sessions
*   ✅ `app/api/stripe/webhook/route.ts` - API endpoint to handle Stripe webhooks
*   ✅ `components/BuyCreditsButton.tsx` - Reusable button component for initiating credit purchases
*   ✅ `app/buy-credits/page.tsx` - Page displaying available credit packages
*   ✅ `app/checkout/success/page.tsx` - Page shown after successful Stripe checkout
*   ✅ `app/checkout/cancel/page.tsx` - Page shown after cancelled Stripe checkout
*   ✅ `docs/plan_credits_stripe_integration.md` - This planning document

**Files Modified (✅):**

*   ✅ `app/api/auth/[...nextauth]/route.ts` - Added Prisma adapter and credits to user session
*   ✅ `.env` / `.env.local` - Added Stripe keys and database connection strings

**Files Still Pending (⏳):**

*   ⏳ `components/CreditBalanceDisplay.tsx` - Optional global component to display credits
*   ⏳ Existing API endpoints that will consume credits (e.g., `app/api/image-generator/route.ts`)
*   ⏳ Frontend components that trigger credit-consuming actions
*   ⏳ `.env.example` - Update with placeholders for all required environment variables
*   ⏳ `README.md` - Update with documentation for the credits and Stripe integration
*   ⏳ `docs/CHANGELOG.md` - Update with the latest changes

## 5. Dependencies to Add

*   `stripe`
*   Database client (e.g., `pg` for PostgreSQL)
*   ORM (e.g., `prisma`, `@prisma/client`)
*   NextAuth Adapter for the ORM (e.g., `@next-auth/prisma-adapter`)

## 6. Addressing Key Pitfalls (Summary from User Feedback)

This section summarizes how the plan aims to address the key pitfalls kindly provided by the user.

1.  **Concurrent-spend race**: Addressed in **Task 3.1** by emphasizing database transactions with appropriate isolation (e.g., `SERIALIZABLE` or row-level locks like `SELECT ... FOR UPDATE`) when checking and deducting credits.
2.  **Stale session value**: Addressed in **Task 1.2** (noting session `credits` can be stale), **Task 2.3** (suggesting optional session update post-purchase), **Task 3.1** (mandating DB read for critical checks), and **Task 3.2** (client-side re-fetching).
3.  **Webhook idempotency & security**: Addressed in **Task 2.3** by mandating Stripe webhook signature verification and checking `stripePaymentIntentId` against the `CreditPurchase` table to prevent duplicate processing.
4.  **Refunds & chargebacks**: Addressed by including an optional `CreditAdjustment` table in **Task 1.1** and suggesting handling `charge.refunded` webhooks in **Task 2.3** for automated credit deduction, or via a manual admin process.
5.  **Unauthorised “free” calls**: Addressed in **Task 3.1** by requiring credit checks and deductions to use the latest balance fetched directly from the database within a transaction, not client-supplied or stale session values.
6.  **Serverless connection limits**: Addressed in **Task 1.1** by advising the selection of a database/ORM solution that handles connection pooling effectively in serverless environments (e.g., Prisma, Neon, Vercel Postgres, Supabase).
7.  **Missing ledger**: Addressed in **Task 1.1** by making `CreditPurchase` and `CreditSpend` tables mandatory for a full audit trail, with `User.credits` as a denormalized sum.
8.  **Product mismatch**: Addressed in **Task 2.2** and **Task 2.4** by using Stripe `priceId`s (representing specific products/packages in Stripe) for credit purchases, rather than hardcoding amounts, allowing flexibility in pricing and promotions via the Stripe Dashboard.
9.  **Legal/VAT**: Acknowledged as a critical business consideration. While the technical plan doesn't implement tax logic, it notes that Stripe Tax or custom solutions would be needed. This is outside the direct scope of the current development tasks but important for overall deployment.
10. **Edge/Node mismatch**: Addressed in **Task 2.2** and **Task 2.3** by explicitly stating that API routes interacting with the Stripe Node.js SDK must run on the Node.js runtime, not the Edge runtime.

## 7. Next Steps

1.  User to confirm database preference.
2.  User to set up Stripe account, products (with `priceId`s), and obtain API keys.
3.  Proceed with Phase 1 implementation upon approval and database choice.
