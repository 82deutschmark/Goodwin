
Product Requirements Document — “Mr. Goodwin” Personal Butler App
Vision
Democratize aristocracy by giving every user the feeling of a discreet household staff, reminiscent of an Edwardian country house, orchestrated by a single digital head butler named Mr. Goodwin.

Definitions
• Model Context Protocol (MCP) — host/client/server pattern for secure orchestration of software agents.  
• Vector Store (VS) — encrypted database that stores text embeddings so the household staff “remembers” user preferences.  
• Product Requirements Document (PRD) — this specification.  
• Application Programming Interface (API) — contract exposed by external services (food delivery, ride‑hail, etc.).

User Story
A user installs Mr. Goodwin. Goodwin greets them, learns basic preferences, and then quietly “hires” additional servant‑clients whenever new needs arise (wake‑up alarms, headlines, meals, transport, fitness guidance, and so on).  All interactions are embedded in the VS so the staff anticipates habits without repeated instruction. 

Staff‑to‑Component Mapping
Head Butler — Mr. Goodwin  
 • Role: MCP host, policy engine, registry of servants.

Core Servants (for POC)
Mr. Setter — Valet: personal alarms, meeting reminders, routine, appointment maker, task scheduler,  
Mr. Brightwell - Artist: image generation
Mr. Scrivner - Scribe: all user documents
Mr. Gearhart - Mechanic: all user equipment, manuals, repair, web search for manuals and parts etc, photo ID of stuff
Ms. Primrose - Gardener: weather, plant ID, photos of plants for identification, 
Ms. Bellamy - Chambermaid: context manager backed by Vector Store
Mr. Tuckett - Footman - internal message router
Mr. Pennon - Archivist - vector store management into correct buckets
Mrs. Featherstone - Housekeeper - security, consent, and privacy enforcement

Future 
Mrs. ???  - Cook — meal ordering and kitchen management  
Mr. ??? - Coachman — ride‑hail and itinerary tracking  
Mr. Pengrove - Private Secretary : news and correspondence digest  

Prospective Servants (future iterations)
• Fitness Instructor “Mr. Armstrong” — integrates with wearable devices, plans workouts.  
• Personal Shopper “Mrs. Worthington” — manages online shopping carts, wardrobe suggestions.  
 • Investment Advisor “Mr. Sterling” — tracks budgets, savings goals, market summaries.  
 • Language Tutor “Miss Lingard” — schedules daily practice, tracks progress.  
 • Travel Agent “Mr. Travers” — books trips, manages tickets and reservations.

Functional Requirements
FR‑1 Onboarding: single‑step biometric authentication, consent banner, preference intake.  
FR‑2 Intent Parsing: Goodwin analyses user requests and routes them to the correct servant.  
FR‑3 Dynamic Hiring: when a new domain is detected, Goodwin spins up a servant‑client via MCP capability negotiation.  
FR‑4 Memory: every dialogue turn is converted to an embedding and stored in the VS for retrieval.  
FR‑5 Privacy Controls: local‑first storage with optional cloud sync; user can wipe or export data at any time.  
FR‑6 Notification Styles: system notifications use subtle servant‑themed icons and sounds.

Non‑Functional Requirements
• Average response time under one second for local actions and under three seconds for external API calls.  
• Offline fallback for critical tasks (alarm, local calendar).  
• Extensible servant software‑development‑kit with automated security linting.  
• Encrypted audit logs retained for thirty days.

Data & Memory Schema
VectorStoreRecord = { id, servant, timestamp, embedding[1536], raw_text, metadata }  
Goodwin references nearest‑neighbor results to personalise replies and scheduling.

Success Metrics
• Monthly active users  
• Task completion rate  
• Average manual correction events per user

Risks & Mitigations
• Over‑automation loops — configurable approval thresholds.  
• Data breaches — field‑level encryption, key rotation, and audit alerts.  
• External API changes — nightly contract tests with mock servers.

Growth Roadmap
Phase 1 — Core servants for routine day planning.  
Phase 2 — Release prospective servants as opt‑in modules.  
Phase 3 — Open servant marketplace for third‑party developers, vetted by Housekeeper security policies.

