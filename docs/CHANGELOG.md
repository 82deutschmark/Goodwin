<!--
This changelog follows the conventions of Keep a Changelog (https://keepachangelog.com/en/1.0.0/).
It tracks all significant changes made to the OpenAI Responses Starter App project.
To add new entries, append them under a new date heading (YYYY-MM-DD) in reverse chronological order (newest first).
Use the following sections as needed: Added, Changed, Fixed, Removed, Deprecated, Security.
-->
# Changelog

## [2025-07-15] OAuth Debugging Enhancements and OAuthCallback Error Troubleshooting
### Added
- Enhanced NextAuth configuration with comprehensive error logging and debugging
- New diagnostic API route `/api/auth/debug` for troubleshooting OAuth and database connectivity issues
- Simplified authentication configuration (`options-simple.ts`) for isolating complex adapter issues
- Database connection validation in custom user creation flow
- Detailed error logging for OAuth callback failures

### Changed
- Improved error handling in custom `createUser` adapter method with better validation
- Enhanced debug logging for all NextAuth events and callbacks
- Fixed type compatibility issues with AdapterUser interface
- Temporarily enabled debug mode in production for troubleshooting
- **Updated canonical domain to `gptpluspro.com` (non-www) with proper redirects**

### Fixed
- Removed hardcoded redirect URI that could cause OAuth callback mismatches
- Improved email handling to ensure non-null values for NextAuth compatibility
- Added proper error boundaries and stack trace logging for adapter failures
- **Updated Vercel redirect configuration to redirect www to non-www**

**Note:** Remember to disable debug mode and remove the debug route in production after troubleshooting
- Author: Claude (gpt-4.1-nano-2025-04-14)
- Timestamp: 2025-07-15

## [2025-05-27] Image Generation UI Authentication Requirement
- The image generation UI now requires authentication, matching the chat behavior.
- Only authenticated users can access and use the image generation form; unauthenticated users see a sign-in prompt.
- Improved consistency and security for premium features.
- Author: Cascade (gpt-4.1-nano-2025-04-14)
- Timestamp: 2025-05-27

## [2025-05-27] Build Fixes, TypeScript Module Declarations, and Auth Import Correction
- Fixed build error by correcting the import path for `authOptions` in `app/layout.tsx` (now imported from `@/app/api/auth/options`).
- Added TypeScript module declarations for `react-syntax-highlighter` and its Prism styles to resolve missing type errors during build.
- Confirmed clean build with no blocking errors or type issues.
- No changes made to rate limiting or credits logic per user instruction.
- Author: Cascade (gpt-4.1-nano-2025-04-14)
- Timestamp: 2025-05-27


## [2025-05-26] Fixed Vercel Build Issues and Updated NextAuth Configuration
- Fixed NextAuth route handler exports to be compatible with Next.js App Router
- Updated NextAuth configuration to work with latest versions of Next.js and NextAuth
- Removed type errors that were causing build failures
- Ensured proper TypeScript types for session and user objects
- Author: Cascade (gpt-4.1-nano-2025-04-14)
- Timestamp: 2025-05-26

## [2025-05-26] Domain Standardization and Authentication Improvements
- Standardized on `gptpluspro.com` (non-www) as the canonical domain
- Added automatic redirects from www to non-www for consistent authentication
- Updated NextAuth configuration to use the canonical domain for OAuth callbacks
- Enhanced error handling and logging for OAuth flow
- Fixed redirect_uri mismatch issues with Google OAuth
- Updated environment variables to reflect the canonical domain
- Author: Cascade (gpt-4.1-nano-2025-04-14)
- Timestamp: 2025-05-26

## [2025-05-26] Fixed Authentication Race Condition
- Fixed race condition in NextAuth user creation that caused "record not found" errors
- Improved user creation flow to set initial credits during user creation instead of in a separate update
- Added proper TypeScript types for better type safety and error prevention
- Updated dependencies to ensure compatibility (NextAuth, Prisma, TypeScript)
- Author: Cascade (gpt-4.1-nano-2025-04-14)
- Timestamp: 2025-05-26

## [2025-05-26] Authentication and Layout Improvements
### Added
- Session provider wrapper component for NextAuth
- Dedicated auth buttons component with Sign In/Sign Out functionality
- Credits display for authenticated users

### Changed
- Updated layout with proper header and navigation
- Improved authentication flow visibility
- Fixed author attribution to DeepSeek V3 (0324) across all files

### Fixed
- Module import resolution for auth components
- TypeScript type declarations for auth buttons

## [2025-05-25] Fixed Prisma Build Error for Vercel Deployment
- Pinned both `@prisma/client` and `prisma` to version 6.8.2 for full compatibility
- Added troubleshooting advice to README for Prisma version mismatch errors
- If you see errors about `enableTracing` or `Failed to deserialize constructor options`, ensure both Prisma dependencies are exactly the same version and reinstall all dependencies

- Fixed critical Prisma client initialization error in Vercel deployment by adding `prisma generate` to build process
- Added `postinstall` script to ensure Prisma client is always generated after npm install
- Refactored Prisma client initialization to address compatibility issues with Prisma v5.17.0/6.8.2
- Updated Prisma client to prevent exhausting database connection limits in serverless environments
- Updated documentation with proper Prisma deployment requirements
- Updated project README with current features and deployment instructions
- Author: Claude 3.5 Sonnet
- Timestamp: 2025-05-25

## [2025-05-25] Implemented Credit Management System
- Created centralized credit service for all credit operations with proper transaction isolation
- Implemented MCP server integration with 30% markup on all external service costs
- Added specialized assistant coordination for Mr. Brightwell (image generation) and Mr. Gearhart (mechanic)
- Created API endpoints for credit consumption, balance checking, and transaction history
- Enhanced UI with credit balance display, transaction history, and improved buy-credits page
- Author: Cascade (Claude 3.5 Sonnet)

## [2025-05-25] Finalized Stripe Checkout Session Endpoint and Credits Backend
- Finalized and linted `/api/stripe/create-checkout-session` for Next.js 13+ API routes.
- Upgraded to Stripe API version 2024-06-20.
- Improved error handling and secure session authentication.
- Documentation and audit trail updated.
- Stripe credits backend complete and lint-free.
- Frontend scaffold complete: BuyCreditsButton, /buy-credits, /checkout/success, /checkout/cancel.
- Credit balance refresh and consumption endpoints implemented.
- Author: gpt-4.1-nano-2025-04-14

## [2025-05-25] Stripe Credits System Core Complete
- All core Stripe credits backend and frontend scaffolding is complete.
- Next phase: integrate credits consumption logic into all premium features, in line with the modular, context-rich, privacy-first agentic assistant vision (see conversion_longterm.md).
- Author: gpt-4.1-nano-2025-04-14

## [2025-05-25] Build/Lint Fixes and Code Quality Improvements
- Fixed all Prisma import issues (now using named export).
- Refactored OpenAI usage to use OpenAI class (no Configuration/OpenAIApi).
- Fixed React hook dependency warnings in all affected components:
  - Wrapped fetchCredits in useCallback in CreditBalanceDisplay
  - Wrapped fetchHistory in useCallback in CreditHistoryDisplay
  - Fixed dependency arrays in useEffect hooks
- Escaped unescaped single quotes in JSX as per lint rules.
- Enhanced session handling in credits route to properly include user ID.
- Improved buy-credits page to display current credit balance and helpful messages.
- Implemented proper error handling in GoodwinService's storeInteraction method.
- Added comprehensive type safety throughout the application.
- Updated module-level comments in all modified files with author/model and explanations.
- Fixed all Prisma create/findMany calls to use correct property names and ordering.
- All major backend and frontend blockers for deployment are now resolved. Project is robust, lint-free, and ready for production deployment.
- Author: Cascade (gpt-4.1-nano-2025-04-14)
- Timestamp: 2025-05-25

## [Unreleased] - YYYY-MM-DD

## 2025-05-14

### Changed
- **UX Improvement:** Temporarily hid the "File Search", "Web Search", and "Functions" sections in the `ToolsPanel` component to simplify the user interface. These sections were commented out in `components/tools-panel.tsx` and can be re-enabled later if needed.

## 2025-05-13

### Added
- Configured project for AdMob/AdSense integration by placing `ads.txt` in the `public` directory.
- Created a plan document (`admob_changelog_plan.md`) for AdMob integration and changelog refactoring.
- Integrated the main Google AdSense script into `app/layout.tsx` using `next/script` for global ad readiness.

### Changed
- **Major Deployment Shift:** Switched primary deployment target from Cloudflare Workers to Vercel due to practical challenges with Cloudflare. Vercel deployment was successful on the first attempt.
  *Note: Previous Cloudflare-specific configurations in `wrangler.toml`, `open-next.config.ts`, and `package.json` scripts related to Cloudflare deployment might be deprecated or subject to removal in future updates if Vercel remains the primary deployment platform.*
- Reformatted `CHANGELOG.md` to follow Keep a Changelog conventions, improve readability, and ensure reverse chronological order.
- Updated site metadata (title and description) in `app/layout.tsx` by user. (Approx. 19:21 2025-05-13)
- Modified `public/openai_logo.svg`: Changed fill to pink (#E75480) and added a dashed purple (#8A2BE2) stroke.
- Modified `public/openai_logo.svg` again (Approx. 19:25 2025-05-13): Changed main logo fill to yellow (#FFD700), removed previous dashed stroke, and added a black border to the white background circle.
- Modified `public/openai_logo.svg` a third time (Approx. 19:30 2025-05-13): Added a black dotted outline (stroke-width: 1, stroke-dasharray: "2 2") to the main yellow logo shape.

### Technical Notes
- Preferred OpenAI model: `gpt-4.1-nano-2025-04-14`.

## 2025-05-10

### Added
- **Initial Project Setup & Assessment**
  - Created `CHANGELOG.md` to track project modifications.
  - Conducted initial project assessment, identifying key features:
    - Next.js-based chat interface.
    - Integration with OpenAI Responses API.
    - Support for tools (web search, file search, function calling).
    - Streaming response handling.
    - State management via Zustand.
  - Set up the development environment:
    - Configured OpenAI API key in `.env` file.
    - Successfully launched the local development server.

### Removed
- Removed previous "Planned Changes" section as it was a placeholder (TBD).

<!--
Previous entry regarding Cloudflare setup before the switch to Vercel on 2025-05-13:

### Cloudflare Workers Deployment Setup - (Pre-Vercel Switch)
- Configured project for Cloudflare Workers deployment
  - Added OpenNext Cloudflare adapter (@opennextjs/cloudflare)
  - Created wrangler.toml with Workers configuration
    - Set main entry point to `.open-next/worker.js`
    - Added nodejs_compat flag for Node.js compatibility
    - Configured assets directory and binding
  - Added open-next.config.ts for adapter defaults
  - Updated package.json with preview/deploy scripts
  - Optimized Next.js config for Cloudflare compatibility
  - Set up environment variables in Cloudflare Workers dashboard
    - Added OPENAI_API_KEY for API authentication
  - Configured GitHub integration with Cloudflare Workers
    - Build command: `npm install && npx opennextjs-cloudflare build`
    - Deploy command: `npx wrangler deploy`
-->
