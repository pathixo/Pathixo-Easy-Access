# PATHIXO EXPO PLATFORM — API SPECIFICATION

This document outlines the server-side API architecture, authentication, rate limiting, and endpoint specifications for the Pathixo Expo Platform.

---

## 1. Security & Authentication Architecture

1. **Zero-Trust Client Access**:
   - The browser never queries the database directly. All endpoints reside under `src/app/api/` and execute with `import "server-only"`.
   - Database operations use `@supabase/supabase-js` configured exclusively with the secret `SUPABASE_SERVICE_ROLE_KEY`.

2. **Visitor Identity & Session Management**:
   - Upon successful registration via `POST /api/register`, the server sets an **HttpOnly, Secure, SameSite=Lax** signed cookie named `px_visitor_session`.
   - The cookie contains an encrypted/signed HS256 JWT using `SESSION_SECRET` with a 12-hour expiration time.
   - The payload contains only `{ visitorId: string }` — no personally identifiable information (PII) is stored in the cookie or transmitted in client URLs.

3. **Rate Limiting (Upstash Redis with In-Memory Dev Fallback)**:
   - `POST /api/register`: 5 requests per minute per IP.
   - `POST /api/spin`: 10 requests per minute per IP.
   - `POST /api/inquiry`: 5 requests per minute per IP.
   - `POST /api/events`: 60 requests per minute per IP.

4. **Bot Protection (Cloudflare Turnstile)**:
   - Evaluated server-side on registration and business inquiries.
   - Supports development test keys (`1x00000000000000000000AA`).

5. **Uniform Response Envelope**:
   ```json
   // Success response
   {
     "ok": true,
     "data": { ... }
   }

   // Error response
   {
     "ok": false,
     "error": {
       "code": "ERROR_CODE_STRING",
       "message": "Human-readable description.",
       "details": { ... } // Optional validation field errors
     }
   }
   ```

---

## 2. API Endpoints

### 2.1 Register Visitor (`POST /api/register`)
Captures booth visitor details, verifies consent, stores lead information, and sets the signed session cookie.

- **Rate Limit**: 5 req/min per IP
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
  ```json
  {
    "full_name": "Aarav Sharma",
    "email": "aarav.sharma@example.com",
    "mobile": "+91 98765 43210",
    "company": "Tech Corp",
    "designation": "Head of Engineering",
    "interested_product": "vakxo",
    "message": "Interested in AI automation.",
    "privacy_consent": true,
    "marketing_consent": false,
    "turnstile_token": "...",
    "utm_source": "qr_booth",
    "utm_medium": "banner",
    "utm_campaign": "expo_mart_2026"
  }
  ```
- **Validation Rules**:
  - `full_name`: Required, 2–120 characters, trimmed.
  - `email`: Required, valid email format, normalized to lowercase.
  - `mobile`: Required, normalized to 10 digits; must match Indian format `^[6-9]\d{9}$`.
  - `privacy_consent`: Required boolean; must be strictly `true`.
  - Schema is `.strict()`: Rejects unknown fields.
- **Success Response (200 OK)**:
  - Sets `px_visitor_session` HttpOnly cookie.
  ```json
  {
    "ok": true,
    "data": {
      "registered": true
    }
  }
  ```
- **Error Responses**:
  - `400 Bad Request` (`VALIDATION_ERROR`): Missing or invalid fields.
  - `400 Bad Request` (`BOT_VERIFICATION_FAILED`): Turnstile verification failed.
  - `409 Conflict` (`DUPLICATE_REGISTRATION`): Phone number or email already registered.
  - `429 Too Many Requests` (`RATE_LIMITED`): Exceeded rate limit.

---

### 2.2 Spin Lucky Draw (`POST /api/spin`)
Triggers the server-side, atomic Lucky Draw allocation for the registered visitor.

- **Rate Limit**: 10 req/min per IP
- **Authentication**: Requires valid `px_visitor_session` cookie.
- **Request Headers**:
  - `Idempotency-Key`: UUID or unique request key (required).
- **Request Body**: None (identity comes strictly from session cookie).
- **Success Response (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "ok": true,
      "already_spun": false,
      "spin_id": "4b684cb3-0000-0000-0000-000000000000",
      "reward_id": "...",
      "reward_name": "Special Exhibition Thank-You Voucher",
      "reward_slug": "thank-you-pass",
      "reward_type": "no_prize",
      "reward_description": "Thank you for visiting Pathixo at Expo Mart!",
      "reward_code": "PX-7K9A-4M2X",
      "expires_at": "2026-02-27T10:00:00.000Z",
      "redemption_status": "not_redeemed",
      "redemption_instructions": "Present this code at the Pathixo exhibition stall."
    }
  }
  ```
- **Idempotent Retry**:
  - If the same visitor or idempotency key calls again, returns the identical outcome with `"already_spun": true`.
- **Error Responses**:
  - `401 Unauthorized` (`UNAUTHORIZED`): No active visitor session.
  - `400 Bad Request` (`MISSING_IDEMPOTENCY_KEY`): Missing `Idempotency-Key` header.
  - `429 Too Many Requests` (`RATE_LIMITED`): Exceeded spin rate limit.

---

### 2.3 Get Existing Spin Result (`GET /api/spin/result`)
Retrieves the logged-in visitor's previous spin result.

- **Authentication**: Requires valid `px_visitor_session` cookie.
- **Success Response (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "spin_id": "...",
      "reward_code": "PX-7K9A-4M2X",
      "redemption_status": "not_redeemed",
      "expires_at": "2026-02-27T10:00:00.000Z",
      "created_at": "2026-01-27T10:00:00.000Z",
      "reward": {
        "id": "...",
        "slug": "thank-you-pass",
        "name": "Special Exhibition Thank-You Voucher",
        "description": "...",
        "reward_type": "no_prize",
        "redemption_instructions": "..."
      }
    }
  }
  ```
- **Error Responses**:
  - `401 Unauthorized` (`UNAUTHORIZED`): No session cookie.
  - `404 Not Found` (`NO_SPIN_FOUND`): Visitor has not spun yet.

---

### 2.4 Submit Business Inquiry (`POST /api/inquiry`)
Submits custom software development consultations or project inquiries.

- **Rate Limit**: 5 req/min per IP
- **Request Body**:
  ```json
  {
    "full_name": "Priya Nair",
    "email": "priya@enterprise.com",
    "mobile": "+91 99887 76655",
    "company": "Enterprise Tech",
    "service_needed": "AI Product Engineering",
    "project_description": "We need to build an automated document AI ingestion engine.",
    "estimated_budget": "₹5,00,000 - ₹10,00,000",
    "turnstile_token": "..."
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "submitted": true
    }
  }
  ```

---

### 2.5 Get Public Products Catalog (`GET /api/products`)
Fetches active products with public fields for the homepage product cards.

- **Caching**: Next.js CDN / cache revalidated every 60 seconds (`revalidate = 60`).
- **Success Response (200 OK)**:
  ```json
  {
    "ok": true,
    "data": [
      {
        "id": "...",
        "slug": "vakxo",
        "name": "Vakxo",
        "tagline": "Intelligent AI-Powered Workspace & Productivity",
        "description": "...",
        "key_features": ["..."],
        "destination_url": null,
        "badge_text": "Coming Soon",
        "launch_status": "coming_soon",
        "display_order": 1
      }
    ]
  }
  ```

---

### 2.6 Record Telemetry Event (`POST /api/events`)
Asynchronously logs anonymous engagement events (card clicks, page views).

- **Rate Limit**: 60 req/min per IP
- **Allowed Event Types**:
  `page_view`, `registration_start`, `registration_complete`, `product_card_click`, `product_link_click`, `spin_start`, `spin_complete`
- **Request Body**:
  ```json
  {
    "event_type": "product_card_click",
    "product_slug": "vakxo",
    "metadata": {
      "source": "homepage_grid"
    }
  }
  ```
- **Success Response (200 OK)**:
  ```json
  {
    "ok": true,
    "data": {
      "recorded": true
    }
  }
  ```
