# Product Omnibook: Pathixo Easy Access

> **Document Type:** Master Product Specification & AI Context Omnibook  
> **Project Name:** Pathixo Easy Access (`Pathixo-Easy-Access`)  
> **Target Platform:** Mobile-First Web Application (QR-Accessed)  
> **Primary Purpose:** Instant On-Ground Event Hub, Lead Capture & User Acquisition for Pathixo  
> **Last Updated:** November 2026  

---

## 1. Executive Summary & Vision

**Pathixo Easy Access** is a rapid-deployment, mobile-dedicated web platform engineered specifically for on-ground expos, tech events, university summits, and startup showcases.

When visitors and students approach the Pathixo booth or banners, they scan a physical QR code that immediately opens this lightweight, high-performance web experience in their native mobile browser. The platform functions as both an instantaneous navigation directory (providing direct links to Pathixo's core website, featured products, clearance deals, and memberships) and an interactive lead acquisition engine powered by a gamified "Spin the Wheel" lucky draw.

### Core Strategic Objectives
1. **High-Velocity Lead Capture (Primary Goal):** Convert foot traffic, students, and expo attendees into verified, qualified leads (Name, Email, WhatsApp/Phone Number) before they leave the booth.
2. **Instant Navigation Hub:** Eliminate the friction of searching for URLs by presenting thumb-friendly, oversized action buttons linking to the Pathixo ecosystem.
3. **Incentivized Engagement (Gamification):** Hook visitors with an interactive "Spin the Wheel" lucky draw offering real-time discounts, offers, trial memberships, and clearance specials.
4. **On-Ground Robustness:** Deliver sub-second loading speeds and rock-solid reliability even in crowded expo venues with congested cellular network connections.

---

## 2. Target Audience & Event Context

### 2.1 User Personas
* **College Students & Tech Enthusiasts:** Looking for quick freebies, student discounts, platform trials, and exciting tech products. Attention span is short (< 15 seconds).
* **Expo Visitors & Early Adopters:** Looking for innovative tools, exclusive expo offers, and rapid overviews of what Pathixo builds.
* **Partners & Potential Investors:** Looking for a quick one-tap path to review the main Pathixo website, company portfolio, and contact credentials.

### 2.2 Environmental Constraints (The "Expo Reality")
* **Cellular Network Congestion:** Hundreds or thousands of devices connected to nearby cell towers simultaneously. Page weight must be ultra-light, avoiding bloated external dependencies.
* **Diverse In-App Browsers:** Users will scan QR codes using default camera apps, Google Lens, Instagram, WhatsApp, or third-party QR scanners. The web app must operate seamlessly inside sandboxed webviews without broken cookies, pop-up blockers, or layout breaks.
* **One-Handed Mobile Interaction:** Users are standing, walking, holding bags, or talking to booth reps. Navigation buttons must be oversized, ergonomic, and centered in the thumb reach zone.

---

## 3. System Architecture & User Flow

```
[Physical Expo Banner / QR Code]
             │
             ▼
   [Instant QR Scan] (Camera / Lens / In-App Browser)
             │
             ▼
[Pathixo Easy Access Mobile Web App]
   ├── 1. Brand Header (Pathixo Logo & Tagline)
   ├── 2. Primary Showcase Button: "🎡 Spin the Wheel & Win!"
   └── 3. Quick-Access Link Grid:
          ├── Main Pathixo Website
          ├── Product A Showcase
          ├── Product B Showcase
          ├── Special Expo Deals & Clearance
          └── Community & Social Channels
             │
             ▼ (User taps "Spin the Wheel")
[Lead Capture Gate Pop-up / Modal]
   ├── Full Name
   ├── Email Address
   ├── Phone / WhatsApp Number
   └── [ "Unlock My Spin" Button ]
             │
             ▼ (Validation Passed & Lead Saved)
[Interactive Spin the Wheel Engine]
   ├── Wheel Rotation Animation & Haptic/Sound
   ├── Outcome Calculation (Discount / Offer / Membership)
   └── Reward Screen:
          ├── Custom Voucher Code
          ├── "Copy Code" & "Claim on Pathixo" CTA
          └── WhatsApp / SMS confirmation trigger
```

---

## 4. Feature Specifications

### 4.1 Mobile-First UI & Link Hub
* **Strict Mobile Form Factor:** Designed explicitly for mobile viewports (360px to 430px width standard). If loaded on desktop monitors, the interface should render within a centered, sleek mobile container mockup to preserve the intended layout.
* **Oversized Action Buttons:**
  * Minimum touch target size: 56px height with generous margins.
  * Tactile feedback: CSS active states (`transform: scale(0.98)`), micro-haptic animations.
  * Visual Hierarchy:
    1. **Hero CTA (Primary Glow / Shimmer):** "🎡 Spin to Win Discounts & Rewards!"
    2. **Secondary Core Action:** "🌐 Visit Main Pathixo Website"
    3. **Tertiary Product Badges:** Direct product links with icons and micro-copy (e.g., "Product Alpha – Explore Now", "Exclusive Expo Offers").
* **Zero Navigation Clutter:** No complex hamburger menus or deep nested pages. Everything is accessible in a single scrollable mobile view.

### 4.2 Lead Capture Gate (Pre-Spin Modal)
To play the lucky draw, users must first submit their information. This is the core data funnel of the platform.

* **Required Form Fields:**
  1. **Full Name:** Text input, minimum 2 characters.
  2. **Email Address:** Standard RFC-compliant email validation.
  3. **Phone Number:** 10-digit mobile number with international country code selector (defaulting to local region, e.g., `+91`).
* **Micro-Copy & Incentives:**
  * Title: *"Win Up to 50% Off & Exclusive Pathixo Memberships!"*
  * Subtitle: *"Enter your details below to unlock your lucky spin."*
* **Consent & Compliance:**
  * Concise opt-in note: *"By continuing, you agree to receive your reward code and updates via WhatsApp/Email."*
* **UX Nuances:**
  * Autofill-friendly attributes (`autocomplete="name"`, `autocomplete="email"`, `autocomplete="tel"`).
  * Smooth transition directly from form submission into the active wheel view without page reload.

### 4.3 Gamification Engine: "Spin the Wheel"
* **Mechanics & Appearance:**
  * Circular multi-segment wheel (typically 6 to 8 segments) styled with Pathixo brand colors.
  * Segment Examples:
    * `10% Off Any Pathixo Plan`
    * `20% Off Pathixo Core`
    * `Free 1-Month Premium Membership`
    * `Exclusive Expo Clearance Pass`
    * `Mega Mystery Reward`
    * `Better Luck Next Spin` *(or replaced with minimum guaranteed reward for high user satisfaction)*
* **Reward Distribution Logic:**
  * Configurable weighting parameters (e.g., higher probability for introductory discounts, controlled rarity for full free memberships).
  * Guaranteed "Win" feeling to maintain high attendee enthusiasm at the booth.
* **Winner Modal / Claim Card:**
  * Celebratory confetti animation (lightweight CSS/canvas).
  * Clear display of the winning voucher code (e.g., `EXPO-WIN-7281`).
  * One-tap **"Copy Voucher"** button.
  * One-tap **"Claim on Pathixo.com"** deep link redirecting directly to the product checkout/registration with coupon auto-applied.

### 4.4 Fraud Mitigation & Duplicate Prevention
* **Single Spin Rule:** Users should not be able to spam the wheel to cycle through prizes.
* **Local Fingerprinting:** Store completion status and lead ID in `localStorage` and `sessionStorage`.
* **Lead Deduplication:** Backend / database unique constraint on `phone` and `email` for the current event campaign ID. If a user enters an existing phone number, offer a gentle prompt: *"Looks like you've already spun! Here is your saved reward."*

---

## 5. Data Capture Schema & Integrations

### 5.1 Lead Object Schema
```json
{
  "lead_id": "uuid-v4",
  "full_name": "Alex Doe",
  "email": "alex.doe@example.com",
  "phone": "+919876543210",
  "campaign_source": "EXPO_NOV_2026",
  "captured_at": "2026-11-27T17:30:00Z",
  "prize_won": "Free 1-Month Premium Membership",
  "voucher_code": "PATHIXO-MEM-992",
  "device_info": {
    "user_agent": "Mozilla/5.0 (iPhone; CPU iPhone OS...)",
    "screen_resolution": "390x844"
  },
  "utm_parameters": {
    "source": "qr_banner_1",
    "medium": "offline_qr",
    "campaign": "pathixo_easy_access"
  },
  "sync_status": "synced"
}
```

### 5.2 Storage & Transmission Pipeline
* **Primary Target:** Cloud database (Supabase, Firebase Firestore, or Pathixo REST API endpoint).
* **Offline / Low-Signal Resilience (IndexedDB Queue):** If the user's connection drops right when submitting, the form data is saved into local `IndexedDB` and queued for retry as soon as network ping succeeds.
* **Instant Notification Dispatch (Optional):**
  * WhatsApp Business API or SMS gateway (e.g., Twilio, Gupshup) sending the voucher code directly to the attendee's phone.
  * Automated welcome email sent to the participant's inbox.

---

## 6. On-Ground Clearance, QA & Audit Protocol

To guarantee zero breakdowns during live expo hours, the application must pass this clearance protocol before field deployment:

### 6.1 Performance & Delivery Budgets
* **First Contentful Paint (FCP):** < 1.2 seconds on 3G network simulation.
* **Total JavaScript Bundle Size:** < 120 KB gzipped.
* **Image Assets:** WebP/AVIF format, fully compressed, SVGs for icons and logos.
* **No Blocking External Fonts:** Use system font fallbacks or preloaded subset fonts to eliminate font-swap flashing.

### 6.2 Browser & Environment Clearance Matrix
| Client / Engine | Environment | Verification Checklist |
| :--- | :--- | :--- |
| **iOS Safari** | iOS 16, 17, 18+ | 100vh viewport bug check (address bar expansion), bottom bar tap collision. |
| **Android Chrome** | Android 12 to 15 | Back-button navigation behavior, virtual keyboard input overlap. |
| **Instagram In-App Browser** | iOS & Android | Modal pop-up rendering, clipboard copy permissions. |
| **WhatsApp In-App Browser** | iOS & Android | External link opening, URL parameter preservation. |
| **Google Lens / Native Camera** | Stock Android & iOS | Direct QR scan trigger, instant deep URL resolution. |

### 6.3 Physical QR Code Specifications
* **QR Error Correction Level:** Set to **Level H (High)** (allows up to 30% damage/distortion without read failure).
* **Contrast:** Dark QR code on clean white backing; avoid glossy laminates that create harsh glare under expo spotlights.
* **URL Structure with UTM Tracking:**
  `https://easy.pathixo.com/?utm_source=expo_stall&utm_medium=qr&utm_campaign=launch_2026`

---

## 7. Recommended Technical Stack (Reference for Dev Team)

* **Frontend Framework:** Next.js (App Router) or Vite + React / Svelte (lightweight static build).
* **Styling Engine:** Tailwind CSS (utility-first, zero runtime CSS overhead).
* **Animations:** Canvas-Confetti (lightweight canvas), CSS transforms for wheel spinning, Lucide Icons.
* **Form Handling & Validation:** Zod or lightweight regex validator.
* **State & Persistence:** LocalStorage + lightweight API client with retry mechanism.

---

## 8. Directory & Component Structure Blueprint

```
pathixo-easy-access/
├── product.md                     # This master document
├── README.md                      # Quickstart and developer setup
├── public/
│   ├── assets/
│   │   ├── pathixo-logo.svg       # Crisp brand logo
│   │   ├── wheel-pointer.svg      # Indicator needle for spin wheel
│   │   └── favicon.ico
│   └── sounds/
│       └── tick.mp3               # Audio micro-interaction (optional)
├── src/
│   ├── components/
│   │   ├── Header.tsx             # Pathixo brand header & banner
│   │   ├── ActionLinks.tsx        # High-visibility quick access buttons
│   │   ├── LeadModal.tsx          # Name/Email/Phone capture modal
│   │   ├── SpinWheel.tsx          # Canvas/SVG gamified wheel
│   │   ├── WinnerCard.tsx         # Voucher display & direct claim link
│   │   └── Footer.tsx             # Social links & copyright
│   ├── lib/
│   │   ├── api.ts                 # API submission & error recovery
│   │   ├── storage.ts             # LocalStorage & deduplication helpers
│   │   └── validation.ts          # Input sanity checks (phone/email)
│   ├── pages/ or app/
│   │   └── page.tsx               # Primary mobile entry view
│   └── styles/
│       └── globals.css
└── package.json
```

---

## 9. AI Agent & Developer Instructions

When working on this repository, any assisting AI agent or engineer must adhere to the following rules:

1. **Mobile Experience is Sacred:** Never design desktop-first with responsive mobile afterthought. All UI decisions, touch targets, and typography must be sized for mobile screens (360px–414px baseline).
2. **Prioritize Conversion over Complexity:** The lead capture and spin-to-win funnel is the business priority. Never introduce friction (e.g., OTP login, complex passwords, multi-step questionnaires).
3. **Fail-Safe Data Preservation:** Never lose a lead due to network hiccups. All form entries must be preserved locally before network dispatch.
4. **Performance Integrity:** Keep third-party npm packages to an absolute minimum to prevent slow load times on expo cellular networks.
