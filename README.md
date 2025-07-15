
# Mr. Goodwin: An Agentic AI Butler Experience

This application, originally cloned from https://github.com/openai/openai-responses-starter-app, has been extensively customized into a credit-based system for using OpenAI's API with Stripe integration for payments. It is deployed at https://gptpluspro.com for authenticated users.

## Authentication
- **Google OAuth 2.0** for secure sign-in
- **Credit-based access** to premium features
- **Secure session management** with NextAuth.js
- **Canonical domain**: All traffic is automatically redirected to `https://gptpluspro.com` for consistent authentication

## Mr. Goodwin: An Agentic AI Butler Experience

The core vision of this project is to create "Mr. Goodwin" - a head butler from Edwardian times who delegates tasks to specialized AI staff members via Model Context Protocol (MCP) tools. Mr. Goodwin represents the forefront of the agentic AI assistant movement by democratizing the aristocratic experience of having a household staff through AI.

PRD — Mr. Goodwin: Edwardian era servant hierarchy adapted for AI
1. Objective
Create a personal AI butler service that abstracts away AI complexity through a Victorian household staff metaphor. Users interact only with Mr. Goodwin, the head butler, who orchestrates specialized AI servants to handle all requests.
2. Core Philosophy
User Experience: Victorian aristocrat - never worry about technical details, tell Goodwin what you want and he will get it done.
Credit System: "Gas tank" model - fill up and forget until low
Service Quality: Mr. Goodwin is infallible; servants can be "hired/fired" (swapped)
Memory: Everything remembered in vector store for increasingly personalized service

3. The Household Staff
Mr. Goodwin (Head Butler)

Intent classification and request routing
Context injection from personal memory
Response formatting and quality assurance
Credit management and servant orchestration

Specialized Servants

Mr. Brightwell (The Artist) - Image generation and visual content
Mr. Codsworth (The Programmer) - Code writing, debugging, technical tasks
Mr. Penngrove (The Personal Secretary) - Article writing, correspondence, documentation
Mr. Wiseman (The Researcher) - Information gathering, fact-checking, analysis
Mr. Greenthumb (The Gardener) - Horticultural advice, plant care, garden planning
Mr. Gearhart (The Mechanic) - Repair guidance, troubleshooting, maintenance advice

4. Technical Architecture
4.1 Request Flow
User → Mr. Goodwin → Context Injection → Servant Selection → Task Execution → Response Formatting → User
                          ↕
                    Vector Store (Personal Memory)
4.2 Vector Store Schema
sqlCREATE TABLE memories (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    servant TEXT, -- which servant handled this
    intent_category TEXT, -- coding, art, writing, etc.
    timestamp TIMESTAMPTZ,
    embedding VECTOR(1536),
    raw_request TEXT,
    response_summary TEXT,
    preferences_extracted JSONB, -- art style, coding language, etc.
    project_tags TEXT[] -- garden, car_repair, blog_writing, etc.
);
4.3 Servant Registry
javascriptconst servants = {
  "mr-brightwell": {
    capabilities: ["image-generation", "visual-design"],
    providers: ["dall-e-3", "midjourney", "stable-diffusion"],
    primary_provider: "dall-e-3"
  },
  "mr-codsworth": {
    capabilities: ["programming", "debugging", "code-review"],
    providers: ["claude-sonnet", "gpt-4", "gemini-pro"],
    primary_provider: "claude-sonnet"
  }
  // ... etc
}
5. Functional Requirements
FR-1: Single chat interface - users only interact with Mr. Goodwin
FR-2: Automatic context injection based on user history and preferences
FR-3: Transparent servant swapping when primary provider fails
FR-4: Credit deduction without user notification (gas tank model)
FR-5: Memory storage for every interaction with preference extraction
FR-6: Intent classification routing to appropriate servants
FR-7: Response quality assurance and formatting by Mr. Goodwin
6. Smart Context Examples
User: "Create a picture of a dog"
Goodwin's Context Injection: Queries vector store → finds user prefers Yorkies, watercolor style, outdoor settings
Enhanced Request to Mr. Brightwell: "Create a watercolor painting of a Yorkie in a garden setting"
User: "Fix my car's engine problem"
Goodwin's Context Injection: Queries vector store → finds user owns 2021 RAM 1500 Warlock pickup truck
Enhanced Request to Mr. Gearhart: "Diagnose engine issue for 2021 RAM 1500 Warlock pickup truck based on these symptoms..."
7. Non-Functional Requirements

Response time: < 2 seconds for servant selection and context injection
Uptime: 99.5% availability
Security: End-to-end encryption for all user data (not need for prototype or POC)
Scalability: Support for servant provider failover 
Privacy: User data never shared between servants or stored by providers (not need for prototype or POC)

8. Implementation Phases
Phase 1: Core Goodwin + Vector Store + Mr. Codsworth (your primary use case)
Phase 2: Add Mr. Brightwell + basic context injection system
Phase 3: Add Mr. Penngrove + Mr. Wiseman + enhanced memory extraction
Phase 4: Add Mr. Greenthumb + Mr. Gearhart + servant failover system
Phase 5: Polish, optimization, and beta testing
9. Success Metrics

Context relevance: <5% user corrections to auto-injected context
Servant routing accuracy: >95% to correct specialist
Credit burn rate: Predictable and reasonable for user value

10. User Experience Principles

Effortless: Never make users think about which AI to use
Personal: Gets smarter about preferences over time
Reliable: If a servant fails, user never knows - another handles it



![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)

This repository contains a NextJS starter app built on top of the [Responses API](https://platform.openai.com/docs/api-reference/responses).
It leverages built-in tools ([web search](https://platform.openai.com/docs/guides/tools-web-search?api-mode=responses) and [file search](https://platform.openai.com/docs/guides/tools-file-search)) and implements a chat interface with multi-turn conversation handling.

Features:

- Multi-turn conversation handling
- Streaming responses & tool calls
- Display annotations
- Web search tool configuration
- Vector store creation & file upload for use with the file search tool
- Function calling
-
- Stripe credit purchase & refund automation via secure webhooks
  - Credits awarded/refunded automatically based on Stripe events
  - All product/price IDs managed in .env for safety and maintainability
  - Security-reviewed, robust, and ready for production (2025-05-25)

This app was meant to be used as a starting point to build a conversational assistant. I am customizing it for my needs.
My prefered model is `gpt-4.1-nano-2025-04-14`. For image generation, I use `gpt-image-1` 
I use GitHub for version control.
I use Vercel for deployment.
The domain is registered via Cloudflare.

## Image Generation Feature (Added 2025-05-19 by GPT-4.1)

This app now supports generating images using OpenAI's gpt-image-1 model. Users can:
- Enter a prompt
- Select the number of images (1-10)
- Choose image size (`1024x1024`, `1024x1536`, `1536x1024`, or `auto`)
- Select quality (high, standard, low)

### How to Use
1. Go to the main page and find the **Image Generator** section.
2. Enter your prompt and select your preferred options.
3. Click **Generate Image**.
4. Generated images will appear below, with download links.

### Technical Details
- Images are generated server-side via `/api/generate-image` using your OpenAI API key (set in `.env`).
- Only supported sizes are available in the UI to prevent API errors.
- The app uses Next.js, is deployed to Cloudflare Workers via OpenNext, and is fully CI/CD enabled with GitHub integration.
- Image rendering uses Next.js `<Image />` for optimal performance and bandwidth.

See `docs/changelog.md` for a detailed list of changes.

## Deployment Requirements

### Prisma Version Troubleshooting (Vercel & Local)

If you see errors mentioning `enableTracing` or `Failed to deserialize constructor options` during build or runtime, it means your Prisma CLI and client versions are mismatched. To fix:
1. Ensure both `prisma` and `@prisma/client` are set to the exact same version in your `package.json` (this project uses `6.8.2`).
2. Delete your lockfile (`package-lock.json`, `yarn.lock`, or `pnpm-lock.yaml`) and the `node_modules` directory.
3. Run `npm install` (or `yarn install`/`pnpm install`).
4. Run `npx prisma generate`.
5. Commit the updated lockfile and deploy again.

This will resolve all Prisma version mismatch errors on Vercel and locally.


### Prisma Database Setup

This application uses Prisma with PostgreSQL for database management. For successful deployment (especially on Vercel), the following setup is required:

1. **Environment Variables:**
   - `DATABASE_URL`: Your PostgreSQL connection string
   - For Vercel PostgreSQL: Use the `POSTGRES_PRISMA_URL` provided by Vercel

2. **Build Configuration:**
   - The project is configured to run `prisma generate` before building to prevent the common Prisma client initialization error on Vercel
   - This is handled in the `build` script and the `postinstall` script in package.json

3. **Local Development:**
   - Run `npx prisma generate` after pulling changes that modify the database schema
   - Use `npx prisma db push` to apply schema changes to your development database
   - Optionally use `npx prisma studio` to view and edit your database content through a visual interface

### NextAuth Security Configuration

When using `next-auth` for authentication, it is **CRITICAL** to set a `NEXTAUTH_SECRET` environment variable in your production environment (e.g., Vercel environment variables) and also in your `.env` file for local development (especially if testing with HTTPS). This secret is used to sign cookies and tokens, ensuring the security of your user sessions.

You can generate a strong secret using the following command in your terminal:
```bash
openssl rand -hex 32

---

## Development Notes (2025-05-27)
- Fixed build error by correcting the import path for `authOptions` in `app/layout.tsx` (should be imported from `@/app/api/auth/options`).
- Added TypeScript module declarations for `react-syntax-highlighter` and its Prism styles to resolve missing type errors during build.
- If you add new packages with missing type declarations, create a `.d.ts` file in the `types/` directory as shown for `react-syntax-highlighter`.
- Always check the import paths for configuration objects to avoid module export errors in Next.js App Router projects.
- Author: Cascade (gpt-4.1-nano-2025-04-14)
- Timestamp: 2025-05-27
```
Add this generated secret to your `.env` file like so:
```
NEXTAUTH_SECRET=your_generated_secret_here
```
And ensure it is also set in your Vercel deployment environment variables.

