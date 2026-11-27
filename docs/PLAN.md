# PATHIXO EXPO PLATFORM — PHASED PLAN

Goal: a secure, working, deployed expo platform by the deadline. Priority is P0 (must ship) > P1 (if time) > P2 (later, NOT now).
Rule: never sacrifice security or the spin integrity for polish.

## Suggested timeline (start now; adjust to your deadline)
| Phase | Name | Time box | Can run in parallel? |
|---|---|---|---|
| 0 | Accounts, assets, decisions | 30-45 min | — (you, not the agent) |
| 1 | Scaffold + database + RLS + spin function | 1.5 h | No |
| 2 | Backend APIs | 2 h | No |
| 3 | Public website + Spin & Win UI | 2.5 h | Yes, with Phase 4 (different folders) |
| 4 | Admin login + dashboard | 2 h | Yes, with Phase 3 |
| 5 | Security hardening + tests + load test | 1.5 h | No |
| 6 | Deploy + QR + real-phone test | 1 h | No |
| 7 | Documentation finish + event runbook | 45 min | Docs are written throughout |

If time runs out, cut in this order (NEVER cut the first four items of "must keep"):
Cut: advanced analytics, product-event tracking, admin reward editing UI, advanced filters, fancy animation.
Must keep: server-side spin + atomic inventory, one-spin-per-visitor, RLS + admin auth, registration + DB storage, privacy/terms pages, production test.

## Phase 0 — Accounts, assets, decisions (YOU)
Checklist:
- [ ] GitHub repo created (private)
- [ ] Supabase project (use Pro for the event; free tier can pause when idle). Note: project URL, anon key, service-role key (keep secret).
- [ ] Vercel account (Pro for commercial use) connected to the GitHub repo
- [ ] Upstash Redis database (URL + token)
- [ ] Cloudflare Turnstile site (site key + secret key)
- [ ] Domain / subdomain decided (e.g. expo.pathixo.com)
- [ ] Assets: logo (SVG/PNG), Vakxo URL + image + facts, Crock PDF facts/URL/status, contact email/phone, LinkedIn URL
- [ ] Reward list, quantities, probabilities, expiry, redemption rules (approved by Pathixo)
- [ ] Event dates + stall details for the terms page
- [ ] Save the original master prompt as docs/MASTER_SPEC.md
Acceptance: all keys stored in .env.local (never in chat); docs/STATUS.md created.

## Phase 1 — Scaffold, database, RLS, spin function
Deliver: Next.js app builds; supabase/migrations/*.sql with all tables (visitors, products, product_events, rewards, spins, business_inquiries, admins, audit_logs, analytics events), constraints, indexes, RLS, revoked grants, `spin_wheel()` function, seed data; docs/DATABASE.md.
Acceptance: migrations apply cleanly to a fresh dev project; direct anon-key query to visitors returns nothing/denied; SQL test proves 2 calls to spin_wheel for one visitor give one spin.

## Phase 2 — Backend APIs
Deliver: POST /api/register, POST /api/spin, GET /api/spin/result, POST /api/inquiry, GET /api/products (cached), POST /api/events (aggregate-only analytics); Zod schemas; Turnstile verify; Upstash rate limiting; visitor session cookie; consistent error format; docs/API.md.
Acceptance: curl tests for every path incl. duplicate registration, invalid mobile (Indian 10-digit, starts 6-9), rate-limit 429, spin twice -> same result, spin without cookie -> 401.

## Phase 3 — Public website (mobile-first)
Deliver: hero, about, products (DB-driven cards), services (with inquiry modal), how we work, why Pathixo, registration section + form (consent checkboxes), success screen, Spin & Win wheel + reward result screen, footer, /privacy, /terms (incl. lucky-draw terms), UTM capture, loading/error states.
Acceptance: works at 360-430px; full journey register -> spin -> reward code on a phone; wheel lands on server result.

## Phase 4 — Admin
Deliver: /admin/login, protected layout + middleware, dashboard stats (real data), leads table (search, filters, pagination), visitor detail, business inquiries with status update, lucky-draw overview (inventory, distribution, duplicate attempts), redemption marking, CSV export (with audit log), audit log view; docs/ADMIN-GUIDE.md.
Acceptance: unauthenticated access to /admin and /api/admin/* is rejected; non-admin user rejected; export is logged.

## Phase 5 — Security + testing
Deliver: headers/CSP, security review checklist run, test scripts in /tests: concurrent spin test (50 parallel requests, one visitor -> exactly 1 spin), inventory race test (inventory 5, 100 visitors -> exactly 5 awarded), rate-limit test, malformed-input test, IDOR test, k6 load test; docs/SECURITY.md and docs/TEST-REPORT.md (real results only).
Acceptance: all tests pass or failures are listed honestly in KNOWN-LIMITATIONS.md.

## Phase 6 — Deployment + QR
Deliver: Vercel deploy, env vars, migrations on production Supabase, admin user created + MFA, production redirect URLs, QR (SVG + 2000px PNG) pointing to the real URL with UTM params, production smoke test, docs/DEPLOYMENT.md.
Acceptance: full journey passes on production URL from 2+ Android and 2+ iPhone devices on mobile data; admin sees the test records (then clean up test data).

## Phase 7 — Docs + runbook
Files in /docs: README.md, ARCHITECTURE.md, DATABASE.md, SECURITY.md, API.md, ADMIN-GUIDE.md, DEPLOYMENT.md, RUNBOOK.md, TEST-REPORT.md, KNOWN-LIMITATIONS.md, STATUS.md.
RUNBOOK must cover: event-day checklist, how to check health, backup/export procedure, what to do if the DB/site is down (paper sign-up sheet), how to disable the wheel, how to change prizes/inventory, post-event data retention.

## Scaling notes (production reality)
- Public page is static/CDN-cached; only register + spin write to DB.
- supabase-js over HTTPS means no direct connection exhaustion from serverless functions.
- Indexes on email, mobile, created_at, interested_product; admin tables paginated.
- Test before claiming any capacity number. Record measured numbers in TEST-REPORT.md.
- Expo network is the likeliest failure: retries + idempotency keys + clear offline messaging.
- Day before event: take a full CSV backup; keep a paper sign-up fallback at the stall.
