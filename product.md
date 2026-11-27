# Product Omnibook: Pathixo Easy Access

> **Document Type:** Master Product Specification & AI Context Omnibook  
> **Project Name:** Pathixo Easy Access (`Pathixo-Easy-Access`)  
> **Company:** PATHIXO PRIVATE LIMITED  
> **Target Platform:** Mobile-First Web Application (QR-Accessed at Expos & Summits)  
> **Primary Purpose:** Instant On-Ground Event Hub, Lead Capture & User Acquisition for Pathixo  
> **Active Event:** Meerut Trade Show 2026 (Pathixo Technology Pavilion)  
> **Production URL:** `https://expo.pathixo.com`  
> **Last Updated:** November 2026  

---

## 1. Executive Summary & Vision

**Pathixo Easy Access** is a rapid-deployment, mobile-dedicated web platform engineered specifically for on-ground expos, tech summits, trade shows, and startup showcases by **PATHIXO PRIVATE LIMITED**.

When visitors, students, and prospective clients approach the Pathixo exhibition pavilion or banners, they scan a physical QR code that immediately launches this lightweight, high-performance web experience in their native mobile browser. The platform serves a dual mission:
1. **Instant Navigation Directory:** Delivers thumb-friendly, oversized access buttons to the main Pathixo corporate platform, flagship proprietary products (**Vakxo** and **krocPDF**), clearance deals, and engineering services.
2. **High-Velocity Lead Acquisition Engine:** Converts physical booth foot traffic into verified, qualified leads (Name, Email, WhatsApp Phone Number) gated by an interactive "Spin the Wheel" lucky draw engine.

### Core Strategic Objectives
* **Instantaneous On-Ground Lead Capture (Primary Goal):** Collect verified student and attendee leads before they leave the booth, populating the central CRM pipeline.
* **Frictionless Navigation:** Zero app-install barrier; instantaneous loading on spotty 4G cellular networks via Vercel Edge CDN.
* **Gamified Lucky Draw ("Spin the Wheel"):** Boost booth engagement and excitement with real-time discounts, Vakxo developer passes, krocPDF memberships, and service coupons.
* **Audience Acquisition for Flagship Products:** Drive immediate high-intent traffic to:
  * **Vakxo:** Voice-Native, Local-First Autonomous Desktop AI Dev Agent (`https://vakxo.pathixo.com/`).
  * **krocPDF:** Device-local, 100% private document productivity suite (`https://www.krocpdf.app`).
  * **Pathixo Corporate:** Full-stack AI, mobile, web, and cloud engineering services (`https://pathixo.com/`).

---

## 2. Target Audience & Event Realities

### 2.1 User Personas
* **College Students & Budding Developers:** Drawn to cutting-edge AI dev tools (Vakxo), looking for trial memberships, promo codes, student discounts, and career opportunities. Attention span is short (< 15 seconds).
* **Business Owners & Enterprise Visitors:** Exploring digital transformation, custom AI systems, or enterprise app development from Pathixo's engineering team.
* **Booth Walk-ins & Expo Attendees:** Curious visitors attracted by the "Spin & Win" banners and digital visitor pass gamification.

### 2.2 On-Ground Expo Constraints
* **Cellular Congestion:** Dense crowds straining 4G/5G mobile towers. Page weight must stay ultra-lean (< 120 KB gzipped) with no blocking external scripts or heavy font files.
* **In-App Browser Sandboxes:** QR scans frequently launch inside Google Lens, Instagram, WhatsApp, or default camera webviews. The platform must avoid reliance on external pop-ups, multi-window flows, or fragile cookie policies.
* **Ergonomic One-Handed Operation:** Attendees are standing, walking, holding merchandise, or talking to staff. All primary interaction elements must occupy the ergonomic thumb zone with $\ge 44-56\text{px}$ touch targets.

---

## 3. System Architecture & Flow

```
           [Physical Expo Banner / Stall QR Code]
                             │
                             ▼
     [Instant Scan] (Camera / Lens / WhatsApp / Browser)
                             │
                             ▼
             [Pathixo Easy Access Mobile Portal]
                             │
         ┌───────────────────┴───────────────────┐
         ▼                                       ▼
  [Digital Visitor Pass]                  [Cyber-Portal Hub]
  (Auto-prompt Lead Modal)                 ├── Brand Header (Pathixo)
    ├── Full Name                          ├── Quick Access Links:
    ├── Email Address                      │     ├── Pathixo Main Website
    ├── Phone / WhatsApp Number            │     ├── Vakxo AI Dev Agent
    └── Turnstile Verification             │     ├── krocPDF Document Suite
         │                                 │     └── Engineering Services
         ▼                                 └── Floating Spin Bot Widget
  [Pass Issued + Session Cookie]                         │
         │                                               │
         └───────────────────┬───────────────────────────┘
                             ▼
             [Spin & Win Lucky Draw Wheel]
               ├── Interactive Wheel Physics
               ├── Server-Side Atomic Stored Procedure
               └── Instant Reward Voucher Card:
                     ├── Unique Voucher Code (e.g. VAKXO-A7F29C1B)
                     ├── One-Tap Copy
                     └── Direct Platform Claim Link
```

---

## 4. Feature Specifications

### 4.1 Mobile-First UI & Link Directory
* **Viewport Standards:** Native optimization for 360px, 390px, and 414px mobile viewports. On desktop viewports ($\ge 1024\text{px}$), the UI renders as an expansive dual-column cyber command portal.
* **High-Contrast Touch Buttons:**
  * Minimum touch target height: 56px.
  * Tactile micro-interactions: Active scale down (`0.98`), luminous border glows, electric lime (`#ccff00`) and amber accents.
* **Direct Navigation Links:**
  * **Main Website:** `https://pathixo.com/`
  * **Vakxo Platform:** `https://vakxo.pathixo.com/` (Voice-Native Autonomous AI Dev Agent)
  * **krocPDF App:** `https://www.krocpdf.app` (Private On-Device Document Suite)
  * **Lucky Draw / Spin:** `/spin` or via the interactive `FloatingSpinBot` widget.

### 4.2 Pre-Spin Lead Capture Gate (Visitor Pass Modal)
* **Mandatory Entry Verification:** To spin the wheel and claim discounts, the user must register their details.
* **Input Fields:**
  * **Full Name:** Required, 2–100 characters, sanitised.
  * **Email Address:** Valid RFC email syntax, trimmed.
  * **Phone Number:** 10–15 digits, international phone format supported.
* **Security & Bot Defense:**
  * Cloudflare Turnstile token validation prior to submission.
  * Upstash Redis rate limiting (sliding window: 5 registrations / min / IP).
  * Unique constraint on `(event_code, phone)` and `(event_code, email)` preventing duplicate spin farming.
* **Session Issuance:**
  * Upon valid registration, server sets an encrypted, signed `jose` JWT in an `HttpOnly`, `Secure`, `SameSite=Lax` session cookie (`pathixo_session`).

### 4.3 Gamification Engine: "Spin the Wheel"
* **Client-Side Wheel UI:**
  * 8-segment circular wheel styled in Pathixo's cyber aesthetic.
  * Natural deceleration physics (`cubic-bezier(0.15, 0.9, 0.2, 1.0)`) with haptic/sound feedback.
* **Prize Tiers & Reward Catalog:**
  * `10% Off Pathixo Engineering Services`
  * `20% Off Vakxo Pro Dev Pass`
  * `1-Month Free Vakxo Autonomous Dev Trial`
  * `krocPDF Pro Lifetime Voucher`
  * `Pathixo Tech Swag & Sticker Pack`
  * `Exclusive Expo Clearance Pass`
* **Zero Client-Side Luck Calculation:**
  * The frontend **never** decides the prize.
  * The client triggers `POST /api/spin` with an idempotency key.
  * The server runs PostgreSQL `spin_wheel()` in an ACID transaction:
    * Verifies visitor hasn't spun yet.
    * Selects an active reward from the weighted drop pool.
    * Atomically decrements `remaining_quantity` (guaranteed non-negative via CHECK constraint).
    * Generates a cryptographic voucher code.
    * Returns the exact sector angle for the client wheel to land on.
* **Winner Celebration:**
  * Full-screen celebratory canvas confetti.
  * Voucher code card with 1-tap clipboard copy and direct redemption deep-links.

---

## 5. Component Tree & File Map

```
Pathixo-Easy-Access/
├── product.md                                 # Master Product Omnibook (this file)
├── AGENTS.md                                  # Autonomous Engineering Team Rules
├── GEMINI.md                                  # Gemini Agent Context & Quick Reference
├── docs/                                      # Complete Documentation Suite
│   ├── MASTER_SPEC.md                         # Detailed Technical Specification
│   ├── ARCHITECTURE.md                        # Architectural Diagrams & Flowcharts
│   ├── API.md                                 # REST Endpoints Contract
│   ├── DATABASE.md                            # Schema & Stored Procedure Reference
│   ├── DEPLOYMENT.md                          # Production Vercel & Domain Runbook
│   ├── RUNBOOK.md                             # Event-Day On-Ground Operator Guide
│   ├── SECURITY.md                            # Security Matrix & Threat Mitigations
│   ├── STATUS.md                              # Live Execution Status
│   └── PLAN.md                                # Phased Implementation Plan
├── public/
│   └── assets/qr/
│       ├── pathixo-expo-qr.svg                # Master Vector QR for Banners
│       ├── pathixo-expo-qr.png                # 2000x2000 High-DPI Print QR
│       └── pathixo-expo-qr-dark.png           # Dark Variant QR
├── src/
│   ├── app/
│   │   ├── page.tsx                           # Root Landing Page
│   │   ├── spin/page.tsx                      # Dedicated Spin & Win Page
│   │   ├── admin/                             # Private Admin Portal
│   │   └── api/                               # Server Route Handlers
│   ├── components/
│   │   ├── public/
│   │   │   ├── CyberPortal.tsx                # Dual-Responsive Event Portal
│   │   │   ├── FloatingSpinBot.tsx            # Draggable Spin Lucky Draw Widget
│   │   │   ├── Hero.tsx                       # Event Headline & Quick CTAs
│   │   │   ├── ProductShowcase.tsx            # Vakxo & krocPDF Product Cards
│   │   │   ├── ServicesGrid.tsx               # Pathixo Engineering Capabilities
│   │   │   ├── RegistrationForm.tsx           # Lead Capture Input Form
│   │   │   ├── SpinWheel.tsx                  # Interactive Animated Wheel
│   │   │   └── VisitorPassModal.tsx           # Auto-Opening Digital Pass Gate
│   │   └── admin/
│   │       ├── StallRedemptionTool.tsx        # Booth Staff Voucher Scanner
│   │       └── InquiryStatusSelector.tsx      # Leads Pipeline Tracker
│   └── config/
│       └── site.ts                            # Single Source of Truth for Identity & URLs
└── supabase/
    └── migrations/
        ├── 20260101000000_init_schema.sql     # Database Schema & RLS Policies
        └── 20260101000001_spin_function.sql   # Atomic spin_wheel RPC
```

---

## 6. On-Ground Expo Clearance Checklist

Before live booth opening, verify:
- [x] **Zero Build Errors:** `npm run build && npm run lint && npm run typecheck` passing.
- [x] **QR Scan Resolution:** `public/assets/qr/pathixo-expo-qr.svg` points to `https://expo.pathixo.com` with proper UTM parameters (`?utm_source=qr_booth&utm_medium=banner&utm_campaign=meerut_trade_show_2026`).
- [x] **Rate Limiting Active:** Upstash Redis prevents booth attendees or automated scripts from spamming registrations.
- [x] **Bot Defense Active:** Cloudflare Turnstile validates human interaction without intrusive image captchas.
- [x] **Database Isolation:** Supabase anon key cannot select or mutate `visitors`, `spins`, or `inquiries` directly.
- [x] **Redemption Tool Ready:** Booth staff can access `/admin/lucky-draw` to verify and mark claimed vouchers in real time.
