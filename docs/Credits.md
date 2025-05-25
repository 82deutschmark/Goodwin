<!--
Credits.md
OpenAI Responses Starter App
This file documents the credits system, pricing, user experience, and Stripe integration for purchasing credits in the app. It is intended for business, product, and operations stakeholders. All technical implementation is abstracted away from end users. Author: gpt-4.1-nano-2025-04-14. Last updated: 2025-05-25.
-->

# Credits & Pricing Model

**Summary:**
Users purchase credits to access premium AI features. Credits are abstracted—users see only their balance and refill prompts. All pricing, token usage, and bonuses are managed internally for a seamless experience.

## Credit Packages & Bonuses
| Package (USD) | Credits Granted | Bonus Credits | Total Credits | Stripe Product ID             |
|--------------|----------------|--------------|--------------|-------------------------------|
| $1           | 1,000          | 0            | 1,000        | prod_SNTJvcyEOv1KbM           |
| $5           | 5,000          | 50           | 5,050        | prod_SNTJ8NdbxNPGyV           |
| $10          | 10,000         | 1,000        | 11,000       | prod_SNTJoAwmBvz8c3           |
| $20          | 20,000         | 3,000        | 23,000       | prod_SNTJ6BWV0QEs1M           |
| $50          | 50,000         | 12,500       | 62,500       | prod_SNTJWrCitFoMWh           |
| $100         | 100,000        | 40,000       | 140,000      | prod_SNTJTBlYOjfdz4           |

*Stripe Product IDs are for internal reference only—do not expose to users.*

## How It Works
- **Purchase:** Users buy credit packs via Stripe checkout. Each pack is a Stripe product, mapped to internal credit logic.
- **Award:** On successful payment, credits (with bonuses) are added to the user’s balance.
- **Usage:** Credits are deducted automatically for each AI request, based on token cost × 1.3 markup. Users see only “Credits remaining.”
- **Refill:** When low, users are prompted to refill. No token or per-request cost is shown.
- **Abstraction:** All technical and pricing details are hidden—users interact only with their credit balance.

## User Experience
- **Simple:** Only “Credits remaining” and refill prompts are shown.
- **Transparent:** No token, per-request, or pricing details are exposed.
- **Value:** Bonus credits reward larger purchases. The system is marketed as a better value than $20/mo GPT plans, with concise outputs that help users save credits.

## Security, Privacy, and Internal Accounting
- All credit transactions are securely processed via Stripe and tracked internally.
- User credit balances are maintained in the backend, protected by authentication.
- No sensitive payment or token data is exposed to users.
- All Stripe product IDs and backend logic are for internal use only.

---
This balances opaque credit accounting internally with user-friendly, bonus-driven credit packs and Stripe setup.