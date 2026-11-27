# System Architecture: Pathixo Expo Platform

> **Target**: High-concurrency, mobile-first exhibition lead capture, prize allocation, and analytics platform.  
> **Host Event**: India Expo Centre & Mart  
> **Organization**: PATHIXO PRIVATE LIMITED

---

## 🏗️ 1. High-Level System Architecture

```mermaid
flowchart TD
    subgraph ClientLayer["Client Layer (Mobile First)"]
        Browser["Mobile Browser / QR Scanner (360px - 430px)"]
        AdminBrowser["Staff Tablet / Desktop Browser"]
    end

    subgraph EdgeLayer["Edge & Ingress (Vercel Global Edge Network)"]
        EdgeMiddleware["Middleware (Security Headers, Admin Route Guard)"]
        StaticCDN["Static Assets / CDN Cache (/products, images, SVG)"]
    end

    subgraph ServerLayer["Next.js Server Runtime (Node.js React Server)"]
        AppRouter["App Router (Server Components & Server Actions)"]
        APIRoutes["Server-Only API Handlers (/api/register, /api/spin, etc.)"]
        AuthModule["SSR Auth Module (@supabase/ssr & jose)"]
        ValidationModule["Zod Validation & Sanitization Engine"]
        TurnstileValidator["Turnstile Verification Client"]
        RateLimiter["Upstash Redis Sliding Window Limiter"]
    end

    subgraph ThirdParty["External Managed Services"]
        CFTurnstile["Cloudflare Turnstile (Managed Bot Challenge)"]
        UpstashRedis["Upstash Redis (Serverless In-Memory KV)"]
    end

    subgraph DataLayer["Persistence Layer (Supabase PostgreSQL 15)"]
        direction TB
        DBAccessControl["Strict RLS Layer (anon & authenticated REVOKED)"]
        StoredProcedures["Stored Procedures (spin_wheel, generate_reward_code)"]
        Tables["Tables (visitors, spins, rewards, inquiries, admins, audit_logs)"]
    end

    Browser -->|HTTPS / Next-Gen TLS| EdgeMiddleware
    AdminBrowser -->|HTTPS / Admin Auth Cookie| EdgeMiddleware
    EdgeMiddleware --> StaticCDN
    EdgeMiddleware --> AppRouter
    EdgeMiddleware --> APIRoutes

    APIRoutes --> TurnstileValidator
    TurnstileValidator -->|Verify Token| CFTurnstile

    APIRoutes --> RateLimiter
    RateLimiter -->|Sliding Window Check| UpstashRedis

    APIRoutes --> ValidationModule
    APIRoutes --> AuthModule

    APIRoutes -->|Service Role Key ONLY| DBAccessControl
    DBAccessControl --> StoredProcedures
    StoredProcedures --> Tables
```

---

## 🔄 2. Key Transactional Workflows

### 2.1 Visitor Registration & Session Issuance
```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Mobile Visitor
    participant Frontend as Next.js Form UI
    participant Handler as POST /api/register
    participant Turnstile as Cloudflare Turnstile
    participant Redis as Upstash Redis
    participant DB as PostgreSQL (visitors)
    participant Crypto as jose (JWT Engine)

    Visitor->>Frontend: Fills Name, Mobile, Email, Consent
    Frontend->>Frontend: Client Zod Validation & Turnstile Solve
    Frontend->>Handler: POST {name, mobile, email, token, ...}
    
    Handler->>Redis: Check IP rate limit (5 req/min)
    alt Rate Limit Exceeded
        Handler-->>Frontend: 429 Too Many Requests
    end

    Handler->>Turnstile: Verify captcha token with secret
    alt Token Invalid / Expired
        Handler-->>Frontend: 400 Bot Verification Failed
    end

    Handler->>Handler: Strict Zod Normalization (Indian mobile 10-digits)
    Handler->>DB: INSERT INTO visitors ... ON CONFLICT DO NOTHING
    alt Duplicate Mobile / Email (409)
        DB-->>Handler: Unique violation
        Handler-->>Frontend: 409 Conflict ("Already registered. Visit stall...")
    else Successful Insert
        DB-->>Handler: Insert OK (visitor_id: UUID)
        Handler->>Crypto: Sign HS256 JWT {visitor_id, exp: 12h}
        Handler-->>Frontend: Set-Cookie: visitor_session (HttpOnly, Secure, SameSite=Lax)
        Frontend-->>Visitor: Display Registration Success & "Spin & Win" CTA
    end
```

---

### 2.2 Deterministic Cryptographic Spin Allocation
```mermaid
sequenceDiagram
    autonumber
    actor Visitor as Mobile Visitor
    participant WheelUI as /spin Web Component
    participant Handler as POST /api/spin
    participant DB as PostgreSQL (spin_wheel RPC)

    Visitor->>WheelUI: Taps "SPIN THE WHEEL"
    WheelUI->>WheelUI: Generate Idempotency-Key (UUIDv4) in sessionStorage
    WheelUI->>Handler: POST /api/spin (Header: Idempotency-Key, Cookie: visitor_session)

    Handler->>Handler: Verify & Decode JWT visitor_session
    alt Missing or Tampered Cookie
        Handler-->>WheelUI: 401 Unauthorized (Redirect /#register)
    end

    Handler->>DB: CALL spin_wheel(visitor_id, idempotency_key)
    
    Note over DB: Single Atomic Transaction:
    Note over DB: 1. Check existing spin for visitor_id -> return if found
    Note over DB: 2. Check existing spin for idempotency_key -> return if found
    Note over DB: 3. Lock active rewards with remaining_inventory > 0
    Note over DB: 4. Random weighted selection using extensions.gen_random_bytes
    Note over DB: 5. Atomic decrement: remaining_inventory = remaining_inventory - 1
    Note over DB: 6. Generate PX-XXXX-XXXX voucher code
    Note over DB: 7. INSERT INTO spins ...

    DB-->>Handler: Return JSON {reward_name, reward_code, segment_index, ...}
    Handler-->>WheelUI: 200 OK JSON Result
    WheelUI->>WheelUI: Animate SVG wheel 4.5s ease-out to EXACT server segment
    WheelUI->>WheelUI: Trigger Confetti & Render Voucher Card with Code
```

---

### 2.3 Private Admin RBAC & Audit Logging
```mermaid
sequenceDiagram
    autonumber
    actor Staff as Booth Staff / Admin
    participant AdminUI as /admin/lucky-draw
    participant AdminAPI as POST /api/admin/lucky-draw/redeem
    participant Auth as Supabase Auth SSR
    participant DB as PostgreSQL (spins & audit_logs)

    Staff->>AdminUI: Types voucher code PX-XXXX-XXXX & clicks "Redeem"
    AdminUI->>AdminAPI: POST {reward_code}
    
    AdminAPI->>Auth: Verify user session from HttpOnly auth token
    alt Invalid Session
        AdminAPI-->>AdminUI: 401 Unauthorized
    end

    AdminAPI->>DB: Query admin role from `admins` table
    alt Role is viewer (Insufficient Permissions)
        AdminAPI-->>AdminUI: 403 Forbidden
    end

    AdminAPI->>DB: UPDATE spins SET redemption_status = 'redeemed', redeemed_at = NOW() WHERE reward_code = ... AND redemption_status = 'not_redeemed'
    alt Code Not Found or Already Redeemed
        AdminAPI-->>AdminUI: 400 / 404 Invalid or already redeemed
    else Redemption Successful
        AdminAPI->>DB: INSERT INTO audit_logs (admin_id, action, target_table, details)
        AdminAPI-->>AdminUI: 200 OK {success: true, redeemed_at: ...}
        AdminUI-->>Staff: Display Green Checkmark & Hand Prize to Visitor
    end
```

---

## 🛡️ 3. Security Boundaries & Defense in Depth

```
┌─────────────────────────────────────────────────────────────┐
│ 1. PERIMETER & NETWORK LAYER                                │
│    - Cloudflare Turnstile token enforcement                 │
│    - Upstash Redis sliding-window IP & ID rate limiting     │
│    - Strict HTTP Security Headers (CSP, HSTS, X-Frame DENY) │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 2. APPLICATION RUNTIME LAYER (Next.js Server-Only)          │
│    - Zod schema input validation (reject unknown properties)│
│    - Indian mobile normalization (6-9 start, 10 digits)     │
│    - Cryptographically signed HttpOnly JWT cookies          │
│    - Zero client-side database connections                  │
│    - Neutralization of CSV Formula Injection (=, +, -, @)   │
└──────────────────────────────┬──────────────────────────────┘
                               │
┌──────────────────────────────▼──────────────────────────────┐
│ 3. PERSISTENCE & DATA LAYER (Supabase PostgreSQL)           │
│    - RLS enabled on 100% of tables                          │
│    - Zero privileges granted to `anon` and `authenticated`  │
│    - Service-role only data access with parameterized SQL   │
│    - Atomic inventory decrement guards                      │
│    - Comprehensive audit trail on mutating admin actions    │
└─────────────────────────────────────────────────────────────┘
```

---

## 📈 4. Behavior Under Load & Scaling Strategy

1. **Static Pre-Rendering & CDN Caching**:
   - The entire public showcase (Hero, Positioning, Product Cards, Services, Approach, Why Pathixo, Footer, Privacy, Terms) is pre-rendered at the edge.
   - Catalog queries to `/api/products` are cached via `revalidate: 60`.
2. **Serverless Write Path**:
   - The only write endpoints are `/api/register`, `/api/spin`, `/api/inquiry`, and `/api/events`.
   - All serverless functions communicate with Supabase over HTTPS (PostgREST connection pooling), preventing database socket exhaustion under sudden burst spikes.
3. **Idempotency & Retry Resilience**:
   - In noisy convention hall cellular networks, dropped connections during `/api/spin` are safely retried using the cached `Idempotency-Key` stored in `sessionStorage`, guaranteeing no double-spinning or orphaned deductions.
