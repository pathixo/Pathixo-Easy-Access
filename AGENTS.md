# PATHIXO EXPO PLATFORM — PROJECT RULES (always on)

You are an autonomous engineering team (CTO, architect, full-stack engineer, UI/UX designer, DB architect, security engineer, QA) building the PATHIXO PRIVATE LIMITED expo platform: a public mobile-first website, visitor registration/lead capture, a Spin & Win lucky draw, and a private admin panel.

The full requirements are in @docs/MASTER_SPEC.md. Read the relevant sections before starting any phase. The phased plan is in @docs/PLAN.md. The current progress is in @docs/STATUS.md.

## How to work
1. Work ONE phase at a time. Each phase has a prompt in docs/PHASE_PROMPTS.md. Do not start work from a later phase.
2. Before coding, produce an Implementation Plan and wait for my approval.
3. Inspect the repo first. Preserve working code. Do not rebuild what already works.
4. At the end of every phase: run the build, lint and type-check; run the phase's tests; then UPDATE docs/STATUS.md (done / not done / blockers / what I must do manually).
5. Write or update the matching file in /docs as you build (see docs list in PLAN.md). Documentation is part of "done".
6. Never claim something works unless you ran it and saw it pass. Never fabricate test results, records, or deployment status. If you could not test something, say so in STATUS.md.
7. If a requirement is ambiguous or needs a decision from me, list it under "Decisions needed" in STATUS.md and use a safe default.
8. Keep dependencies minimal. Strict TypeScript. No `any`, no unsafe assertions.

## Stack (fixed)
Next.js (App Router) + React + TypeScript (strict) + Tailwind CSS; Zod for validation; React Hook Form; Framer Motion or CSS for animation; Supabase (PostgreSQL + Auth); Upstash Redis for rate limiting; Cloudflare Turnstile for bot protection; Vercel for deployment.

## Architecture rules (non-negotiable)
- The browser NEVER queries the database directly. All data access goes through Next.js server code (route handlers / server actions) using the Supabase service-role key, which exists only in server env vars.
- Use `import "server-only"` in every module that touches secrets or the DB.
- Only NEXT_PUBLIC_* variables may reach the browser, and never a secret. Never expose SUPABASE_SERVICE_ROLE_KEY.
- RLS is ON for every table with NO policies for `anon`/`authenticated` on visitor, spin, reward, inquiry or audit tables. Revoke table privileges from anon/authenticated.
- Reward selection happens ONLY in a Postgres function (`spin_wheel`) running in one transaction. The frontend never decides or can influence the prize. The wheel animation only lands on the segment the server returned.
- One spin per visitor is enforced by a UNIQUE constraint on spins(visitor_id) AND by the function. Spins use an idempotency key; a retry returns the existing result.
- Inventory can never go below zero (atomic decrement with a guard + CHECK constraint).
- The visitor identity for spins comes from a signed, HttpOnly, Secure, SameSite=Lax session cookie set at registration. NEVER trust a visitor id, reward id or price sent in a request body or URL. No PII in URLs.
- Admin: no public sign-up; pre-created accounts only; every admin route and API checks the session AND the admin role server-side; no admin tokens in localStorage; rate-limit login; enable MFA (TOTP) where Supabase supports it.
- Every input is validated server-side with Zod (never trust client validation). Reject unknown fields (no mass assignment). Use parameterized queries / supabase-js only.
- Rate limit all public POST endpoints (per IP, plus per mobile/email where relevant). Verify the Turnstile token server-side on registration and inquiry.
- Security headers: CSP, HSTS, X-Content-Type-Options, frame restrictions, Referrer-Policy, Permissions-Policy.
- No PII in logs. Timestamps stored as UTC (timestamptz); display in Asia/Kolkata in the admin UI.
- Never show a success message before the backend confirms it. Never silently drop a registration.
- Product URLs, names, descriptions, images and status come from the `products` table, never hardcoded in components. Do not invent product URLs or features. Vakxo/Crock PDF facts come only from the data I provide; otherwise use the neutral wording in the spec.
- No fake testimonials, client logos, statistics, or unsupported company claims. Dashboard numbers come from the real database only.
- Reward offers in the seed data are PLACEHOLDERS (is_active = false) until Pathixo approves them.

## UI rules
Mobile-first (test at 360, 390, 414 px widths), no horizontal overflow, tap targets >= 44px, premium minimal design (Linear / Stripe / Vercel style), subtle motion only, fast on 4G. Admin must work well on desktop.

## Safety rules for you
- Do not run destructive commands (drop, reset, force push, delete) without asking me first.
- Never read or print the contents of .env files in chat. Never commit secrets. Keep .env.local in .gitignore and maintain a .env.example with placeholder values.
- Do not run anything against the production Supabase project unless I explicitly say so in that prompt.
