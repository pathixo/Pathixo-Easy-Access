# STATUS (agent updates this at the end of every phase)

| Phase | State | Notes |
|---|---|---|
| 0 Accounts/assets | done | Supabase dev project created; keys in .env.local; connection verified; remote git linked |
| 1 Scaffold + DB | done | Next.js scaffold created; SQL migrations, RLS, spin function, seed data applied and verified |
| 2 Backend APIs | done | All 6 endpoints built (/api/register, /api/spin, /api/spin/result, /api/inquiry, /api/products, /api/events); strict Zod validation, Turnstile, session security, rate limiters, build passing |
| 3 Public UI | done | Minimalist mobile-first UI built; Hero, Products, Services, Approach, Registration, Inquiry modal, Spin & Win wheel with confetti, /privacy, /terms; build passing |
| 4 Admin | not started | Next up (Admin login, dashboard, lead triage, lucky draw redemption, CSV export, audit logs) |
| 5 Security + tests | not started | |
| 6 Deploy + QR | not started | |
| 7 Docs + runbook | not started | |

## Decisions needed
- Reward list/probabilities/inventory approval (placeholder rewards set to `is_active = false` in seed data until Pathixo approves)
- Production Domain (e.g., expo.pathixo.com)
- Duplicate-registration policy (default: do not re-issue spin session; stall staff can assist)

## Manual steps for the owner
1. Re-run `supabase/migrations/20260101000001_spin_function.sql` in your Supabase SQL Editor once (adds `extensions.` schema resolution for `gen_random_bytes`).

## Known issues
(none)
