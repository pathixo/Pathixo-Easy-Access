# STATUS — Pathixo Expo Platform

| Phase | State | Notes |
|---|---|---|
| 0 Accounts/assets | done | Supabase dev project connected; keys in `.env.local`; database connectivity verified; remote GitHub repository linked. |
| 1 Scaffold + DB | done | Next.js 14 scaffold created; SQL migrations, RLS enabled on 100% of tables, `spin_wheel()` cryptographic atomic function, seed catalog data applied and verified. |
| 2 Backend APIs | done | All 6 REST endpoints built (`/api/register`, `/api/spin`, `/api/spin/result`, `/api/inquiry`, `/api/products`, `/api/events`); strict Zod input validation, Turnstile bot verification, signed `jose` session cookies, Upstash sliding window rate limiting; 17/17 automated API tests passing. |
| 3 Public UI | done | Re-architected into mobile-first Cyber-Gamified Trade Show Portal; electric lime (#ccff00) & stealth carbon theme matching Vakxo branding; Meerut Trade Show 2026 live HUD; frictionless inline registration directly on `/spin` to eliminate redirect loops; interactive Digital Visitor Pass modal on website cards; Web Audio mechanical ticking SFX + victory chime; confetti animation; guaranteed discount vouchers; duplicate registration recovery with instant voucher retrieval. |
| 4 Admin | done | Overhauled to match the Cyber Lime & Stealth Carbon HUD theme; role hierarchy (`super_admin`, `admin`, `viewer`); neutral System Administrator credentials; live editable Prize Pool & Odds manager (`/admin/lucky-draw`) with live probability weight recalculation; stall voucher quick-redemption tool; audit logs & leads table with `email_status` and `fulfillment_status`; streaming CSV export with sanitization. |
| 5 Security + tests | done | Production security headers (strict CSP, HSTS, X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy, Permissions-Policy); rate limit burst tests passing (20/20); security boundaries passing (6/6: direct anon key RLS block, mass assignment rejected, IDOR token verified); concurrency test scripts in `/tests`. |
| 6 Deploy + QR | done | High-res vector SVG & 2000x2000px 300-DPI PNG stall QR codes generated with UTM tracking; dynamic `robots.txt` & `sitemap.xml`; deployment guide written in `docs/DEPLOYMENT.md`; verified clean production build across 16 routes. |
| 7 Docs + runbook | done | Root `README.md`, `docs/RUNBOOK.md` (event-day checklist, live monitoring, voucher redemption workflow, paper fallback, inventory pause/adjust, EOD export, DPDP compliance), `docs/ARCHITECTURE.md` (Mermaid diagrams & failure models), `docs/KNOWN-LIMITATIONS.md` completed and cross-verified. |

---

## 🎯 Next Steps for the Event Organizers (Owner Checklist)

1. **Database Migration Update**:
   - Re-run `supabase/migrations/20260101000001_spin_function.sql` in your Supabase SQL Editor once (adds explicit `extensions.` schema resolution for `gen_random_bytes`).
2. **Provision Staff Admin Accounts**:
   - Run the local provisioning script:
     ```bash
     node scripts/create-admin.mjs <your-email> <your-password> super_admin "<your-name>"
     ```
3. **Approve Reward Inventory**:
   - In `supabase/seed.sql` or via `/admin/lucky-draw`, review the prize inventory and set `is_active = true` for approved rewards.
4. **Deploy to Vercel**:
   - Follow the step-by-step instructions in `docs/DEPLOYMENT.md` to link the GitHub repository and configure production environment variables.
5. **Print Stall Banners & QR Flyers**:
   - Use `public/assets/qr/pathixo-expo-qr.svg` for booth backdrops and `public/assets/qr/pathixo-expo-qr.png` for table stands. Scan-test from 1 meter.

---

## ⚠️ Known Issues / Open Items
- **#5 (High, security)**: Hardcoded super-admin credentials and default `SESSION_SECRET` fallback remain in code until product auth decision is finalized. Do not treat current built-in creds as production-safe.
- **#6 (High, frontend)**: Fixed in working tree pending commit - VisitorPassModal Turnstile reset on retry.
- **#7 (Medium, backend/admin)**: Fixed in working tree pending commit - redeem endpoint now sets `fulfillment_status` and uses atomic redemption guard.
- **#8 (Medium, backend)**: Fixed in working tree pending commit - dev-no-supabase guards added for `/api/events` and `/api/inquiry`.
- **#9 (Medium, security/admin)**: Fixed in working tree pending commit - rewards page/API restricted to `super_admin`.
- Real Supabase + real Turnstile + email delivery still require production env configuration and verification.
