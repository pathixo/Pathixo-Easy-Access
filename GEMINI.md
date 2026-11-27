# GEMINI AGENT CONTEXT & WORKSPACE INSTRUCTIONS

Welcome to the **Pathixo Easy Access** (`Pathixo-Easy-Access`) project workspace. This repository powers the official on-ground mobile event platform for Pathixo Private Limited.

---

## 1. Project Purpose & Scope

* **Primary Purpose:** Instant QR-landing mobile web application for expos, college summits, and startup events.
* **Core Value Driver:** High-volume lead capture (students & visitors) gated by an interactive "Spin the Wheel" lucky draw engine.
* **Secondary Utility:** Direct link directory (Linktree-style) with oversized touch buttons for Pathixo's main site, products, clearance deals, and memberships.
* **Admin Control:** Private, authenticated admin portal for monitoring live leads, managing reward inventory, viewing real-time analytics, and exporting CSVs.

---

## 2. Master Documentation Directory

Before starting any task or writing code, consult the following source files:
- [product.md](file:///e:/Pathixo-Easy-Access/product.md) – Master Product Omnibook & UX Specifications.
- [AGENTS.md](file:///e:/Pathixo-Easy-Access/AGENTS.md) – Mandatory Engineering Rules & Security Protocols (Always On).
- [docs/MASTER_SPEC.md](file:///e:/Pathixo-Easy-Access/docs/MASTER_SPEC.md) – Comprehensive Database, API, and System Specifications.
- [docs/PLAN.md](file:///e:/Pathixo-Easy-Access/docs/PLAN.md) – Phased Implementation Roadmap.
- [docs/STATUS.md](file:///e:/Pathixo-Easy-Access/docs/STATUS.md) – Current Execution Status, Blockers & Decisions.
- [docs/PHASE_PROMPTS.md](file:///e:/Pathixo-Easy-Access/docs/PHASE_PROMPTS.md) – Deterministic Prompts for Phased Rollout.

---

## 3. Technology Stack & Key Libraries

* **Framework:** Next.js (App Router, React 19 / 18, TypeScript strict mode)
* **Styling:** Tailwind CSS (Mobile-first responsive utilities)
* **Form & Validation:** React Hook Form + Zod (Strict server-side validation)
* **Animations:** Framer Motion / CSS keyframe transitions + canvas-confetti
* **Database & Authentication:** Supabase (PostgreSQL with RLS + GoTrue Auth for Admin)
* **Rate Limiting & Caching:** Upstash Redis (`@upstash/ratelimit`)
* **Bot Verification:** Cloudflare Turnstile (`@marsidev/react-turnstile`)
* **Deployment:** Vercel

---

## 4. Architectural Guardrails for Gemini Agents

1. **Zero Direct DB Access in Browser:** All database operations use Supabase service role key strictly in server-side route handlers or Server Actions. Never pass client-side Supabase tokens with write access to visitor/spin tables.
2. **Server-Only Isolation:** Enforce `import "server-only"` on all secret-handling and database utility modules.
3. **Database-Controlled Luck Mechanics:** Prize calculation is performed solely inside the PostgreSQL `spin_wheel()` stored procedure wrapped in an ACID transaction. The client wheel animation only lands on the server-awarded sector.
4. **Session Cookie Identity:** Visitor verification for spin requests utilizes an encrypted, signed, HttpOnly session cookie issued during pre-spin lead registration.
5. **Strict Mobile Ergonomics:** Test layouts at 360px, 390px, and 414px widths. Maintain minimum 44px tap targets (recommended 56px for primary CTA buttons). No horizontal scrollbar allowed.
6. **No PII in Logs or URLs:** Keep phone numbers, emails, and names out of console outputs, telemetry logs, and URL query strings.

---

## 5. Standard Development Commands

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run TypeScript checks
npm run typecheck # or npx tsc --noEmit

# Run ESLint
npm run lint

# Build production bundle
npm run build

# Run unit / integration tests
npm run test
```

---

## 6. How to Assist

1. Check [docs/STATUS.md](file:///e:/Pathixo-Easy-Access/docs/STATUS.md) for the active phase.
2. Reference the exact prompt in [docs/PHASE_PROMPTS.md](file:///e:/Pathixo-Easy-Access/docs/PHASE_PROMPTS.md).
3. Generate an Implementation Plan for approval before touching code.
4. Verify every change with build, lint, and test runs.
5. Update [docs/STATUS.md](file:///e:/Pathixo-Easy-Access/docs/STATUS.md) after completing each milestone.
