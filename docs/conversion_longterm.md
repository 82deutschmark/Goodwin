PRD — Mr. Goodwin Prototype (Open AI Responses Starter App Overhaul)
────────────────────────────────────────────────────────────────────

1  Objective  
Transform the Open AI Responses Starter App into a functional prototype of Mr. Goodwin, a personal valet that onboards users, remembers preferences, and dynamically spawns “servant” agents.

2  Scope  
Front‑end: Next.js React web/mobile‑hybrid.  
Back‑end: Node runtime provided by the starter app, extended with servant micro‑services.  
Data: Postgres + pgvector for Vector Store (VS).  
Integrations: , Stripe (bill pay).

3  Key Definitions  
• Model Context Protocol (MCP) — host/client/server pattern for agent orchestration.  
• Vector Store (VS) — encrypted embeddings database.  
• Proof of Concept (POC) — minimal feature build validating concept viability.

4  Architecture Additions  
4.1 Goodwin Host (TypeScript module)  
 • Handles intent parsing, servant registry, memory access.  
 • Exposes `POST /goodwin/route` API to front‑end.  

4.2 Servant Micro‑services (MCP clients)  
 Valet (Mr. Wickham) — alarms & routines  
 Private Secretary (Mr. Penfold) — notification triage  
 Cook (Mrs. Beeton) — meal ordering  
 Coachman (Mr. Trotter) — transport & errands  
 Chambermaid (Miss Wilkins) — VS context manager  

4.3 Vector Store Schema  
`vs_records(id UUID, servant TEXT, ts TIMESTAMPTZ, embedding VECTOR(1536), raw TEXT, meta JSONB)`  

4.4 Biometric Onboarding Flow  
 a. WebAuthn face or fingerprint registration  
 b. Apple Watch pairing handshake  
 c. Preference questionnaire -> VS storage  

5  Functional Requirements  
FR‑1 Biometric sign‑in; fallback passphrase.  
FR‑2 Primary chat UI with Goodwin persona.  
FR‑3 Dynamic servant spin‑up via MCP negotiation when unseen intent detected.  
FR‑4 VS memory write on every dialogue turn; cosine‑similar retrieval < 200 ms.  
FR‑5 Notification Suppression: Private Secretary checks Apple Watch motion API; if moving, queue alerts.  
FR‑6 Bill Pay MVP: Coachman triggers Stripe checkout links; logs receipts to VS.  
FR‑7 Settings page: wipe/export memory; servant enable/disable toggles.  

6  Non‑Functional Requirements  
• P95 local response latency < 1 s; external API < 3 s.  
• Offline fallback for alarms & reminders.  
• End‑to‑end TLS; field‑level AES‑GCM encryption for VS.  
• Automated ESLint + security linting on servant SDK.  
• Nightly mock contract tests for third‑party APIs.  

7  Phased Implementation  
Phase 0 Repo Fork & CI setup (GitHub Actions, Vercel).  
Phase 1 Goodwin Host, biometric onboarding, VS write/read.  
Phase 2 Valet & Private Secretary servants; Apple Watch idle detection.  
Phase 3 Dynamic servant loader; Cook & Coachman.  
Phase 4 Stripe bill pay integration; settings panel.  
Phase 5 Closed beta with 100 users; collect MAU, task completion, correction metrics.  

8  Success Metrics (POC)  
• Onboarding completion rate ≥ 85 %.  
• Average daily interactions per user ≥ 5.  
• Alert‑deferral accuracy ≥ 90 % (only delivered while idle).  
• User memory wipe requests < 3 %.  

9  Risks & Mitigations  
• Biometric false rejects — fallback passphrase flow.  
• Apple Watch dependency — degrade to device motion sensors.  
• Data breaches — rotating KMS keys; audit alerts.  
• Feature creep — phase gate reviews with scope lock.  
