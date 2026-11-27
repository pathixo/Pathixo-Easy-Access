# STATUS — Pathixo Expo Platform

| Phase | State | Notes |
|---|---|---|
| 0 Accounts/assets | done | Supabase dev project connected; keys in `.env.local`; database connectivity verified; remote GitHub repository linked. |
| 1 Scaffold + DB | done | Next.js 14 scaffold created; SQL migrations, RLS enabled on 100% of tables, `spin_wheel()` cryptographic atomic function, seed catalog data applied and verified. |
| 2 Backend APIs | done | All 6 REST endpoints built (`/api/register`, `/api/spin`, `/api/spin/result`, `/api/inquiry`, `/api/products`, `/api/events`); strict Zod input validation, Turnstile bot verification, signed `jose` session cookies, Upstash sliding window rate limiting; 17/17 automated API tests passing. |
| 3 Public UI | done | Frictionless Ungated Main Portal + Gated Lucky Draw Arena: QR scan directly opens the main dashboard (`/`) with instant 1-tap access to all 3 platform cards (Pathixo.com, Vakxo AI, krocPDF) with vibrant electric lime (#ccff00) outlines; zero popups or forced registration on the home hub; native semantic anchor links eliminate popup blocker interception on mobile devices & QR webviews; official Vakxo logo integrated; multi-size favicons and web manifest (`manifest.ts`) generated for PWA; registration form isolated to `/spin`, vertically and horizontally centered with compact 440px height for phone viewports; verified ESLint, TypeScript, and clean production build. |
| 4 Admin | done | Overhauled to match the Cyber Lime & Stealth Carbon HUD theme; role hierarchy (`super_admin`, `admin`, `viewer`); neutral System Administrator credentials; live editable Prize Pool & Odds manager (`/admin/lucky-draw`) with live probability weight recalculation; stall voucher quick-redemption tool; audit logs & leads table with `email_status` and `fulfillment_status`; streaming CSV export with sanitization; 10/10 automated tests passing. |
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
- **#5 (High, security)**: Hardcoded super-admin fallback credentials and default `SESSION_SECRET` fallback are in place for local testing/dev. Ensure production environment variables (`ADMIN_LOGIN_USERNAME`, `ADMIN_LOGIN_PASSWORD`, `SESSION_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`) are set before deployment.
- Real Supabase + real Cloudflare Turnstile + email delivery require production environment variables configured on Vercel per `docs/DEPLOYMENT.md`.

---

## 🎡 Spin & Win Wheel Configuration (Updated)
- **Slice Orientation & Legibility**: Added dynamic 180° text flipping for sectors between 90° and 270° with `dominantBaseline="central"`. All slice labels now render upright and readable.
- **Short Punchy Labels**: Shortened wheel labels (<= 10 chars: `1-Yr Vakxo`, `1-Mo Vakxo`, `30% Vakxo`, `20% Dev`, `50% Cloud`, `6M krocPDF`, `3M krocPDF`, `6-Mo Vakxo`) to eliminate text clipping.
- **Balanced Cyber Palette**: Alternating Cyber Lime (`#ccff00`) and Dark Carbon (`#16191d`) across all 8 segments.
- **Odds & Teaser Logic**:
  - `1-Mo Vakxo Pro`: 35% probability.
  - `6-Mo Vakxo Pro`: 0% probability weight (teaser slot; mathematically cannot be selected by `spin_wheel` function or dev store).
  - Discount vouchers adjusted (`20% Dev`: 15%, `50% Cloud`: 10%, `30% Vakxo`: 15%).
- **Verification**: `npm run typecheck`, `next lint`, and `npm run build` all pass with 0 errors.
