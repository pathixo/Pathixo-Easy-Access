# STATUS (agent updates this at the end of every phase)

| Phase | State | Notes |
|---|---|---|
| 0 Accounts/assets | done | Supabase dev project created; keys in .env.local; connection verified; remote git linked |
| 1 Scaffold + DB | done | Next.js scaffold created; SQL migrations, RLS, spin function, seed data applied and verified; build & typecheck pass |
| 2 Backend APIs | ready to start | Implementation plan ready for review |
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
(All Phase 0 and Phase 1 manual steps completed!)

## Known issues
(none)
