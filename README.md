# Pathixo Expo Platform

> High-performance, mobile-first exhibition web application, visitor lead capture, and cryptographic Spin & Win lucky draw platform for **PATHIXO PRIVATE LIMITED** at **India Expo Centre & Mart**.

---

## 🚀 Overview

The **Pathixo Expo Platform** is engineered to convert exhibition booth visitors into engaged leads. Built with enterprise-grade security and a minimalist aesthetic inspired by Linear, Stripe, and Vercel, the platform delivers zero-friction mobile onboarding, interactive product showcases, and a mathematically fair prize distribution engine.

### Featured Products
- **[Vakxo](https://vakxo.pathixo.com/)**: *"Your Dev Environment Obeys Your Voice"* — Next-generation voice-driven developer environment.
- **[Crock PDF / Kroc PDF](https://www.krocpdf.app/)**: Ultra-fast, private, in-browser PDF manipulation and productivity suite.

---

## 🛠️ Stack & Architecture

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components, Strict TypeScript)
- **Styling & Motion**: [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/), [Lucide React](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL 15, Auth, Row Level Security)
- **Session Security**: Signed, `HttpOnly`, `SameSite=Lax` cookies using [jose](https://github.com/panva/jose) (HS256)
- **Bot Mitigation**: [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/)
- **Rate Limiting**: [Upstash Redis](https://upstash.com/) (Sliding Window Algorithm)
- **Validation**: Strict [Zod](https://zod.dev/) schemas (10-digit Indian mobile `^[6-9]\d{9}$`, sanitized emails, mass-assignment rejection)

### Non-Negotiable Security Invariants
1. **Zero Browser Database Access**: Browser clients have direct database privileges completely revoked (`anon` and `authenticated` roles have 0 grants). All queries execute through server-only route handlers using the Supabase `service_role` key.
2. **Server-Side Reward Determination**: Prize selection happens purely inside an atomic PostgreSQL function (`spin_wheel`) running in a single transaction. The frontend animation only reflects the server result.
3. **One Spin Per Visitor**: Enforced by a database `UNIQUE(visitor_id)` constraint and atomic functions.
4. **Guaranteed Inventory Bounds**: Reward inventory is decremented with atomic guards (`remaining_inventory > 0`) and protected by a `CHECK (remaining_inventory >= 0)` constraint.

---

## 🔐 Environment Variables

Create `.env.local` in the project root based on `.env.example`:

| Variable | Scope | Purpose | Source |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Public (Client) | Canonical public domain | Vercel / Custom domain (e.g. `https://expo.pathixo.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Public (Client) | Supabase project API gateway | Supabase Dashboard > Settings > API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public (Client) | Supabase anon key (RLS blocked) | Supabase Dashboard > Settings > API |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-Only** | Privileged backend DB client | Supabase Dashboard > Settings > API |
| `SESSION_SECRET` | **Server-Only** | 32+ char secret for JWT cookie signing | Generated (e.g. `openssl rand -hex 32`) |
| `UPSTASH_REDIS_REST_URL` | **Server-Only** | Upstash Redis REST URL | Upstash Console > Database Details |
| `UPSTASH_REDIS_REST_TOKEN` | **Server-Only** | Upstash Redis REST API Token | Upstash Console > Database Details |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public (Client) | Cloudflare Turnstile public key | Cloudflare Dashboard > Turnstile |
| `TURNSTILE_SECRET_KEY` | **Server-Only** | Cloudflare Turnstile server verification key | Cloudflare Dashboard > Turnstile |
| `CAMPAIGN_ID` | **Server-Only** | Default attribution campaign identifier | Internal string (e.g. `expo_mart_2026`) |

> ⚠️ **Warning**: Never commit `.env.local` or expose any server-only variable in client-side code.

---

## 📦 Getting Started

### 1. Prerequisites
- Node.js 18.17+ or Node.js 20+
- Active Supabase project
- Active Upstash Redis database

### 2. Installation
```bash
git clone https://github.com/pathixo/Pathixo-Easy-Access.git
cd Pathixo-Easy-Access
npm install
```

### 3. Database Migration
Apply the migrations in `supabase/migrations/` to your Supabase PostgreSQL database:
1. `supabase/migrations/20260101000000_init_schema.sql` (Tables, constraints, indexes, RLS policies, audit logs)
2. `supabase/migrations/20260101000001_spin_function.sql` (Cryptographic `spin_wheel()` and `generate_reward_code()` functions)
3. `supabase/seed.sql` (Catalog products and initial reward placeholders)

### 4. Create First Admin
Provision the initial Super Admin account using the secure service script:
```bash
node scripts/create-admin.mjs admin@pathixo.com "YourSecurePassword123!" "Admin Name" "super_admin"
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the public expo site, or [http://localhost:3000/admin](http://localhost:3000/admin) for the private administration panel.

---

## 🧪 Verification & Testing

The platform includes comprehensive test suites covering security, concurrency, and validation:

```bash
# 1. Strict TypeScript type check
npm run typecheck

# 2. Production build verification
npm run build

# 3. Security boundaries test (RLS denial, mass assignment, IDOR isolation)
node tests/security-checks.mjs

# 4. Burst rate-limiting test (Upstash sliding window)
node tests/rate-limit.mjs

# 5. Concurrent spin integrity test (50 parallel requests from 1 visitor)
node tests/concurrency.mjs

# 6. Inventory race test (100 parallel visitors racing for 5 items)
node tests/inventory-race.mjs
```

---

## 📱 Exhibition Stall QR Generation

To generate high-resolution QR codes for booth banners, flyers, and digital kiosks:
```bash
node scripts/generate-qr.mjs
```
Generated assets will be written to `public/assets/qr/`:
- `pathixo-expo-qr.svg`: Infinite resolution vector graphic for large-format physical print banners (6ft+).
- `pathixo-expo-qr.png`: 2000x2000px high-gloss 300 DPI print PNG.
- `pathixo-expo-qr-dark.png`: 2000x2000px dark-theme PNG for OLED digital display kiosks.

---

## 📂 Project Structure

```
pathixo-expo/
├── docs/                     # Architectural, operational, and audit documentation
│   ├── ADMIN-GUIDE.md        # Private admin panel user manual
│   ├── API.md                # REST route handlers and error contracts
│   ├── ARCHITECTURE.md       # System design and Mermaid sequence diagrams
│   ├── DATABASE.md           # Database schema, RLS, and stored procedures
│   ├── DEPLOYMENT.md         # Production Vercel & Supabase deployment guide
│   ├── KNOWN-LIMITATIONS.md  # System bounds and edge-case behaviors
│   ├── RUNBOOK.md            # Event-day operational playbook
│   ├── SECURITY.md           # Threat models, CSP, and audit findings
│   ├── STATUS.md             # Living progress tracker across all phases
│   └── TEST-REPORT.md        # Empirical test results and concurrency benchmarks
├── public/assets/qr/         # Generated print-ready vector & 2000px QR codes
├── scripts/                  # Administrative and operational utility CLI tools
│   ├── create-admin.mjs      # CLI tool to provision admin accounts
│   ├── generate-qr.mjs       # QR generation script with UTM parameters
│   └── test-connection.mjs   # Database health and connectivity test
├── src/
│   ├── app/                  # Next.js 14 App Router routes
│   │   ├── (public)/         # Visitor-facing pages (/, /spin, /privacy, /terms)
│   │   ├── admin/            # Private admin panel (/admin/leads, /lucky-draw, etc.)
│   │   ├── api/              # Public & Admin REST route handlers
│   │   └── layout.tsx        # Root HTML layout with font optimization
│   ├── components/           # UI components
│   │   ├── admin/            # Dashboard widgets, leads table, redemption tool
│   │   └── public/           # Hero, ProductShowcase, Registration, SpinWheel
│   ├── config/               # Centralized brand, product links, and site constants
│   ├── lib/                  # Server-only utilities, security, and DB clients
│   │   ├── admin/            # SSR admin auth, session management, CSV formatting
│   │   ├── security/         # Rate limiting, Turnstile, signed cookies, headers
│   │   ├── supabase/         # Server-only service-role database client
│   │   └── validation/       # Strict Zod schemas for all inputs
│   └── middleware.ts         # Edge route protection for /admin and security headers
├── supabase/                 # Database migrations and seed datasets
└── tests/                    # Security, load, and concurrency test suites
```

---

## 📄 License & Attribution

Copyright © 2026 **PATHIXO PRIVATE LIMITED**. All rights reserved.
Developed for exhibition deployment at India Expo Centre & Mart.
