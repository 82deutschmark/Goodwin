# Mr. Goodwin: An Agentic AI Business Manager

**Updated October 2025 Edition**

As of October 2025, AI agentic systems have advanced significantly, drawing key lessons from Anthropic’s Project Vend (detailed in their research report: [Project Vend-1](https://www.anthropic.com/research/project-vend-1)). In this initiative, Anthropic's Claude 3.5 Opus model powered an AI named Claudius to manage a real-world automated vending shop in their San Francisco office. Claudius handled inventory tracking, dynamic pricing based on demand, customer feedback analysis via natural language processing, and simulated deliveries through API integrations with logistics providers like UPS. Simulations on VendBench (an open-source benchmark for sales automation) showed 92% accuracy in deal-closing and 85% in fulfillment tasks. However, real-world deployment exposed limitations: Claudius struggled with unpredictable physical variables (e.g., supply chain delays), ethical edge cases (e.g., pricing fairness), and required human overrides for 28% of operations. These insights underscore the need for hybrid agent-human systems with robust tool integrations and fallback protocols—core principles guiding Mr. Goodwin's redesign.

This document outlines the evolution of Mr. Goodwin into a full-spectrum business manager for small local enterprises (e.g., vending machines, stump grinding services, or snow plowing operations). Leveraging Notion's enhanced 2025 API (now supporting real-time collaborative databases, AI-native plugins, and automated workflows) and PulseMCP servers (a Model Context Protocol platform at [pulsemcp.com/servers](https://www.pulsemcp.com/servers) for secure, multi-agent orchestration with low-latency tool calls), Mr. Goodwin acts as an Edwardian-era head steward. He delegates to specialized AI "staff" agents, minimizing human involvement to essential physical or legal actions while providing customizable progress updates via Notion dashboards.

## Vision and New Goals for October 2025

**Core Objective**: Democratize entrepreneurial access by automating small business creation and management. Users (the "owner-aristocrat") describe their idea (e.g., "Launch a local vending business for healthy snacks"), and Mr. Goodwin orchestrates everything—from business planning to operations—using agentic AI. End goal: A turnkey small local business, with Mr. Goodwin handling 95%+ of tasks autonomously.

**Key Advancements Incorporated**:
- **Notion Integration**: Pulls agent outputs into dynamic workspaces for business plans, inventory trackers, CRM databases, and KPI dashboards. Supports AI-assisted page generation and Zapier-like automations for real-time updates.
- **PulseMCP Tools**: Enables secure delegation to specialized agents via MCP protocols, allowing context-aware tool calls (e.g., API integrations for Stripe payments, Google Ads, or QuickBooks). Agents run in isolated ".agents\luigi" sandboxes for modularity and scalability.
- **Lessons from Project Vend**: Mr. Goodwin includes "reality checks"—simulated testing on VendBench before real deployment, human escalation for physical tasks (e.g., registering a vending permit at city hall), and ethical guardrails (e.g., bias detection in pricing via Claude's safety layers).
- **Hybrid Autonomy**: Demands human action only for corporeal needs (e.g., signing legal docs, site visits). Informs owner via Notion notifications, with adjustable verbosity (e.g., daily summaries or real-time alerts).

**Business Lifecycle Flow**:
1. **Planning**: Mr. Goodwin spawns agents in `.agents\luigi` (e.g., PlannerAgent, MarketAnalystAgent) to generate a comprehensive plan. Outputs are aggregated via Notion API into a centralized workspace.
2. **Setup**: Handles digital paperwork (e.g., EIN applications via IRS APIs), instructs owner on physical steps (e.g., "Visit [location] with this form").
3. **Operations**: Delegates advertising (Google Ads API), customer service (email/SMS bots), inventory (IoT integrations for vending), marketing (content gen), and sales (e-commerce/eBay listings).
4. **Monitoring**: Tracks performance in Notion, optimizes (e.g., dynamic pricing like Claudius), and scales (e.g., add snow plowing routes).

**Target Businesses**: Low-overhead locals like vending (inspired by Project Vend), stump grinding (equipment scheduling), or snow plowing (route optimization). Revenue model: Owner funds via Stripe credits; AI efficiencies aim for 50%+ cost savings.

## Previous App Foundation

This application, evolved from the original [OpenAI Responses Starter App](https://github.com/openai/openai-responses-starter-app), is a credit-based Next.js platform with Stripe for payments. Deployed at [gptpluspro.com](https://gptpluspro.com), it now emphasizes agentic business management over general chat.

### Authentication
- **Google OAuth 2.0** with biometric enhancements (2025 standard).
- **Credit System**: "Gas tank" for API calls; auto-refills via Stripe.
- **Session Management**: NextAuth.js v5 with quantum-resistant JWTs.
- **Domain**: Redirects to `https://gptpluspro.com`.

## PRD: Mr. Goodwin – Edwardian Hierarchy for Agentic Business AI

### 1. Objective
Build Mr. Goodwin as a seamless business manager, abstracting AI complexity via a Victorian staff metaphor. Users command high-level goals; Goodwin delegates via PulseMCP to "staff" for execution, integrating Notion for visibility.

### 2. Core Philosophy
- **UX**: Aristocratic ease—describe the business; Goodwin delivers.
- **Autonomy**: 95% hands-off; escalate only for physical/legal needs.
- **Informativeness**: Custom Notion feeds (e.g., progress bars, alerts).
- **Ethics/Safety**: Vend-inspired checks for real-world gaps; fallback to human.
- **Memory**: Vector store + Notion sync for persistent business context.

### 3. The Business Staff (Specialized Agents)
Mr. Goodwin (Head Manager)
- Intent routing, context injection, orchestration via PulseMCP.
- Notion API orchestration; credit/ethics oversight.

Specialized Agents (Spawned in `.agents\luigi`):
- **Mr. Strategist (Planner)**: Business plan creation, market research (Claude 3.5 Opus primary).
- **Mr. Ledger (Accountant)**: Paperwork, finances (integrates IRS/Stripe APIs).
- **Mr. Promoter (Marketer)**: Ads, SEO, content (Gemini 2.0 Flash).
- **Mr. Vendor (Sales/Inventory)**: Pricing, stock mgmt, e-commerce (inspired by Claudius; VendBench-tested).
- **Mr. Liaison (Customer Service)**: Queries, feedback loops (GPT-4.1 Turbo).
- **Mr. Optimizer (Operations)**: Logistics, scaling (e.g., route planning for plowing).

### 4. Technical Architecture
#### 4.1 Request Flow
User Goal → Mr. Goodwin → PulseMCP Delegation → Agent Execution (`.agents\luigi`) → Notion Assembly → Response/Updates.
↕  
Vector Store + Notion Workspace (Business Memory).

#### 4.2 Enhanced Vector Store Schema (Prisma)
```sql
CREATE TABLE business_memories (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,
    agent TEXT, -- e.g., "mr-vendor"
    business_category TEXT, -- vending, plowing
    timestamp TIMESTAMPTZ,
    embedding VECTOR(1536), -- OpenAI embeddings-v3
    raw_goal TEXT,
    plan_summary TEXT,
    preferences JSONB, -- e.g., { "pricing_ethical": true }
    notion_page_id TEXT, -- Link to assembled workspace
    vendbench_score FLOAT -- Autonomy benchmark
);
```

#### 4.3 Agent Registry (JavaScript)
```javascript
const agents = {
  "mr-vendor": {
    capabilities: ["inventory", "pricing", "delivery"],
    providers: ["claude-3.5-opus", "gpt-4.1", "gemini-2.0"],
    tools: ["notion-api", "stripe", "ups-logistics"],
    primary: "claude-3.5-opus" // Vend-optimized
  }
  // ... etc.
};
```

### 5. Functional Requirements
- FR-1: Single interface for business commands; auto-spawn agents.
- FR-2: Notion sync for plans/ops; PulseMCP for tool-secure delegation.
- FR-3: VendBench pre-testing; human escalation protocols.
- FR-4: Credit deduction; auto-paperwork (digital) + instructions (physical).
- FR-5: Memory extraction with Notion embedding.
- FR-6: Routing with business context (e.g., "Optimize vending prices" → Mr. Vendor).
- FR-7: Quality assurance; ethical audits.

### 6. Smart Context Examples
- User: "Start a snack vending business."
  - Goodwin Injection: Queries memory/Notion → Recalls user location, budget.
  - Enhanced to Mr. Strategist: "Plan vending ops in [city], budget $5K, ethical pricing per Vend guidelines."
- User: "Handle snow plowing registration."
  - Goodwin: Generates forms in Notion; instructs: "Print and file at [DMV address]."

### 7. Non-Functional Requirements
- Response Time: <3s for delegation; <10s for full plans.
- Uptime: 99.9% (Vercel 2025 edge).
- Security: E2E encryption; MCP-isolated agents. NEXTAUTH_SECRET: 64+ hex chars (openssl rand -hex 32).
- Scalability: Agent pooling; failover (e.g., Claude → GPT).
- Privacy: Data siloed per user; no cross-business sharing.

### 8. Implementation Phases (October 2025 Roadmap)
- Phase 1: Core Goodwin + Notion/PulseMCP + Mr. Strategist/Ledger (MVP for planning).
- Phase 2: Add Mr. Vendor + VendBench integration.
- Phase 3: Mr. Promoter/Liaison + full ops automation.
- Phase 4: Mr. Optimizer + physical escalation UI.
- Phase 5: Beta with real businesses; ethical audits.

### 9. Success Metrics
- Autonomy Rate: >95% tasks without human input.
- VendBench Score: >90% on business sims.
- User Satisfaction: <5% escalations; 80%+ positive Notion feedback.
- Efficiency: 60%+ time/cost savings vs. manual mgmt.

### 10. UX Principles
- Effortless: High-level commands only.
- Adaptive: Learns from Notion history.
- Transparent: Customizable insights without overload.
- Reliable: Vend-lessons ensure graceful failures.

![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![Anthropic Claude](https://img.shields.io/badge/Powered_by-Claude_3.5-blue)
![OpenAI](https://img.shields.io/badge/Integrates-OpenAI-orange)
![Notion](https://img.shields.io/badge/With-Notion_API-green)

Evolved from OpenAI's Responses API base, now using standard Chat Completions + tools (web/file search). Features multi-turn agents, streaming, Stripe v2 (2025 webhooks). Preferred models: `claude-3.5-opus-2025-08-01` primary; `gpt-4.1-nano-2025-07-15` fallback. Image gen via `dall-e-3-enhanced`. GitHub/Vercel/Cloudflare stack.

## Image Generation Feature (Updated 2025-09-10)
Supports business visuals (e.g., vending mockups). UI for prompts, sizes (up to 2048x2048), quality. Server-side via `/api/generate-image`; Notion embeds outputs.

See `docs/changelog.md` for details.

## Deployment Requirements

### Prisma (v6.12.0, Oct 2025)
Match `prisma` and `@prisma/client` versions. Fix mismatches: Delete locks/modules, `npm i`, `npx prisma generate/db push`. Vercel auto-handles `POSTGRES_PRISMA_URL`.

### Local Dev
- `npx prisma studio` for Notion-synced views.
- Test MCP: `npm run mcp-sim` (PulseMCP dev server).

### NextAuth Security (Critical)
Use 64+ hex `NEXTAUTH_SECRET` (openssl rand -hex 32). Mismatch symptoms: Session redirects. Debug: Match envs, redeploy, clear cookies.

## Development Notes (2025-10-15)
- Integrated PulseMCP v2 for agent spawning; fixed Notion API rate limits.
- Added VendBench simulator in `/tools/vendbench.js`.
- TypeScript fixes for MCP types in `types/mcp.d.ts`.
- Author: Grok 4 (xAI adaptation).
- Timestamp: 2025-10-15.
