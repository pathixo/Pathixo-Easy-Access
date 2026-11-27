# STATUS (agent updates this at the end of every phase)

| Phase | State | Notes |
|---|---|---|
| 0 Accounts/assets | in progress | Dev Supabase project created; keys configured in .env.local; remote git repo linked |
| 1 Scaffold + DB | in progress | Next.js scaffold created; SQL migrations, RLS, spin function, seed data, and tests written |
| 2 Backend APIs | not started | |
| 3 Public UI | not started | |
| 4 Admin | not started | |
| 5 Security + tests | not started | |
| 6 Deploy + QR | not started | |
| 7 Docs + runbook | not started | |

## Decisions needed
- Reward list/probabilities/inventory approval (placeholder rewards set to `is_active = false` in seed data until Pathixo approves)
- Production Domain (e.g., expo.pathixo.com)
- Duplicate-registration policy (default: do not re-issue spin session; stall staff can assist)

## Manual steps for the owner
1. Run `supabase/migrations/20260101000000_init_schema.sql` in your Supabase SQL Editor.
2. Run `supabase/migrations/20260101000001_spin_function.sql` in your Supabase SQL Editor.
3. Run `supabase/seed.sql` in your Supabase SQL Editor to populate products and initial reward definitions.
4. (Optional) Run `supabase/tests/spin_wheel.sql` in SQL Editor to verify the spin function logic passes all tests.

## Known issues
(none)
