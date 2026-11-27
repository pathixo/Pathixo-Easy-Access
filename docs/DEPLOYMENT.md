# PATHIXO EXPO PLATFORM — PRODUCTION DEPLOYMENT & EVENT GUIDE

This runbook details the production deployment, domain linkage, environment configuration, and QR code print specifications for the **Pathixo Expo Digital Platform**.

---

## 1. Architecture & Services Deployment

```
[ Exhibition Visitors (Mobile 4G) ]  ───► [ Vercel Edge CDN (HTTPS) ]
                                                   │
                                     ┌─────────────┴─────────────┐
                                     ▼                           ▼
                        [ Cloudflare Turnstile ]      [ Upstash Redis ]
                             (Bot Defense)              (Rate Limiting)
                                     │                           │
                                     └─────────────┬─────────────┘
                                                   ▼
                                      [ Supabase Production DB ]
                                       - Zero-Trust RLS Policies
                                       - Atomic spin_wheel RPC
```

---

## 2. GitHub & Vercel Deployment Setup

### Step 1: Ensure Code is Pushed to GitHub
The project is linked to:
`https://github.com/pathixo/Pathixo-Easy-Access.git` (branch `main`).

### Step 2: Connect Repository on Vercel
1. Log in to your [Vercel Dashboard](https://vercel.com).
2. Click **"Add New..."** $\rightarrow$ **"Project"**.
3. Import the repository: `pathixo/Pathixo-Easy-Access`.
4. **Project Settings**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Production Environment Variables on Vercel
In the Vercel Project Settings $\rightarrow$ **Environment Variables**, add the following production variables:

| Variable Name | Description | Environment |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production URL (e.g. `https://expo.pathixo.com`) | Production |
| `NEXT_PUBLIC_SUPABASE_URL` | Production Supabase Project URL | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Production Supabase Anon Public Key | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | Production Supabase Service Role Secret Key | Production, Preview |
| `SESSION_SECRET` | 32+ character random secret string | Production, Preview |
| `UPSTASH_REDIS_REST_URL` | Production Upstash Redis REST URL | Production, Preview |
| `UPSTASH_REDIS_REST_TOKEN` | Production Upstash Redis REST Token | Production, Preview |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Cloudflare Turnstile Production Site Key | Production, Preview |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile Production Secret Key | Production, Preview |
| `CAMPAIGN_ID` | Exhibition campaign tag (e.g. `expo_mart_2026`) | Production |

Click **Deploy**.

---

## 3. Production Supabase Setup

1. Open your **Production Supabase Project**.
2. Navigate to **SQL Editor** and run the migrations in order:
   - `supabase/migrations/20260101000000_init_schema.sql` (Creates tables, constraints, RLS)
   - `supabase/migrations/20260101000001_spin_function.sql` (Installs atomic `spin_wheel` function)
   - `supabase/seed.sql` (Seeds Vakxo, Crock PDF, and placeholder rewards)
3. **Authentication Settings**:
   - In Supabase Dashboard $\rightarrow$ **Authentication** $\rightarrow$ **URL Configuration**:
     - **Site URL**: `https://expo.pathixo.com`
     - **Redirect URLs**: `https://expo.pathixo.com/admin/**`
   - In **Authentication** $\rightarrow$ **Sign Up**: Ensure "Allow new users to sign up" is **DISABLED** (admin accounts only).
4. **Create Production Administrator**:
   In your local terminal (configured with production Supabase keys):
   ```bash
   node scripts/create-admin.mjs founder@pathixo.com StrongProductionPassword123# super_admin "Abhijeet Jha"
   ```

---

## 4. Custom Domain & DNS Setup

To use `expo.pathixo.com`:
1. In Vercel Project $\rightarrow$ **Settings** $\rightarrow$ **Domains**, add `expo.pathixo.com`.
2. In your DNS provider (Cloudflare, GoDaddy, or Namecheap) for `pathixo.com`:
   - **Type**: `CNAME`
   - **Name / Host**: `expo`
   - **Target / Value**: `cname.vercel-dns.com`
   - **TTL**: Auto / 300s
3. Vercel will automatically provision a free SSL certificate within 2–5 minutes.

---

## 5. Print-Ready Stall QR Codes

QR codes are generated in [public/assets/qr/](file:///d:/pathixo/pathixo-expo/public/assets/qr/):

1. **Vector SVG (`public/assets/qr/pathixo-expo-qr.svg`)**:
   - **Usage**: Send to printing vendors for large 6-foot roll-up booth banners and flex backdrops. Scales infinitely without loss of sharpness.
2. **2000x2000px PNG (`public/assets/qr/pathixo-expo-qr.png`)**:
   - **Usage**: 300 DPI high-resolution for table-top acrylic tent cards, flyer handouts, and business cards.
3. **Dark-Themed 2000px PNG (`public/assets/qr/pathixo-expo-qr-dark.png`)**:
   - **Usage**: For digital stall TV screens, tablet wallpaper displays, and dark-themed acrylic blocks.

### Embedded QR Target URL:
```
https://expo.pathixo.com/?utm_source=qr_booth&utm_medium=banner&utm_campaign=expo_mart_2026
```

To regenerate with a different custom domain:
```bash
node scripts/generate-qr.mjs https://your-custom-url.com
```

---

## 6. Live Exhibition Smoke Test Checklist

Before opening the booth to visitors on event day, perform the following verification:

- [ ] **QR Scan on iPhone (Safari)**: Scan banner QR code using iOS Camera; verify page loads in under 1.5 seconds on 4G cellular data.
- [ ] **QR Scan on Android (Chrome)**: Scan on Android; confirm zero horizontal overflow at 360px width.
- [ ] **External Links**: Tap "Explore Vakxo" (`https://vakxo.pathixo.com/`) and "Launch Crock PDF" (`https://www.krocpdf.app`); confirm both open in new browser tabs.
- [ ] **Visitor Registration**: Fill in test details with 10-digit Indian mobile; verify privacy consent checkbox is mandatory; submit and confirm success message.
- [ ] **Spin & Win Lucky Draw**: Tap **SPIN**; verify center wheel animates smoothly and awards a voucher code (`PX-XXXX-XXXX`).
- [ ] **Duplicate Block**: Refresh `/spin`; verify the existing won prize is displayed. Try registering again with the same mobile; verify duplicate notice (409) appears.
- [ ] **Admin Verification**: Open `/admin/login` on tablet/laptop; verify the test lead appears in Leads table; look up the voucher code in Lucky Draw tool; click "Verify & Redeem".
- [ ] **Export Backup**: Export leads CSV and confirm spreadsheet opens cleanly without formula injection warnings.
