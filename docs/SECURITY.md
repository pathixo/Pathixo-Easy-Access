# PATHIXO EXPO PLATFORM — SECURITY ARCHITECTURE & THREAT MODEL

This document details the security posture, threat modeling, Content Security Policy, and defensive mitigations implemented in the Pathixo Expo Platform.

---

## 1. Threat Modeling in an Exhibition Context

At a high-traffic physical exhibition (e.g., India Expo Centre & Mart), the platform faces unique adversarial risks:

| Threat Category | Attack Vector | Pathixo Mitigation |
|---|---|---|
| **Brute-Force & Scripted Abuse** | Automated bots scanning the QR code and spamming `/api/register` to exhaust prize inventory. | **Cloudflare Turnstile** token verification on every submission + **Upstash Redis** sliding-window rate limiting (5 req/min per IP). |
| **Concurrent Double-Spinning** | Rapidly firing multiple parallel requests to `/api/spin` via scripts or fast mobile multi-tapping to win multiple prizes. | **Atomic PostgreSQL Transaction** (`spin_wheel`) with unique constraint `spins(visitor_id)`, unique `idempotency_key`, and `FOR UPDATE` inventory guards. |
| **Inventory Over-Allocation** | High concurrency depleting prizes beyond physical stock into negative numbers. | Guarded atomic decrement: `UPDATE rewards SET remaining_inventory = remaining_inventory - 1 WHERE id = ... AND remaining_inventory > 0` + `CHECK (remaining_inventory >= 0)`. Fallback to `no_prize`. |
| **Client-Side Direct Database Access** | Attackers inspecting network tabs, stealing the Supabase anon key, and executing direct `SELECT * FROM visitors`. | **Strict RLS with 100% Revoked Public Access**. All table, routine, and sequence privileges are revoked from `anon` and `authenticated`. Zero direct database queries from the browser; all traffic routes through Next.js `server-only` code using the service role key. |
| **IDOR & Identity Spoofing** | Attacker guessing or tampering with a `visitor_id` parameter in a request body to view another attendee's data or spin for them. | **Cryptographic Signed Cookies (`jose`)**: `visitor_id` is never trusted from request bodies or URL parameters. It is read strictly from an encrypted/signed HS256 JWT cookie (`px_visitor_session`, `HttpOnly`, `SameSite=Lax`, `Secure`). |
| **Mass-Assignment Injections** | Supplying unexpected fields like `{ is_admin: true, role: 'super_admin' }` in registration or inquiry payloads. | **Strict Zod Schemas**: Every endpoint validates with `.strict()`, instantly rejecting any unrecognized attributes. |
| **Spreadsheet Formula Injection (DDE)** | Inserting `=1+2` or `@SUM(...)` into names or companies to trigger arbitrary command execution when admins open exported CSVs in Excel. | **Cell Neutralization**: All cells starting with `=`, `+`, `-`, or `@` are automatically prepended with a single quote (`'`). |
| **Clickjacking & Frame Embedding** | Embedding the admin or registration portal in a malicious iframe. | `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'`. |

---

## 2. Content Security Policy (CSP) & HTTP Security Headers

Implemented in `next.config.mjs` and enforced across all routes:

```http
Content-Security-Policy: default-src 'self' https://*.supabase.co; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com; frame-src 'self' https://challenges.cloudflare.com; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none';
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=(), browsing-topics=()
```

### Justification of Directives:
- `script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com;`: `unsafe-inline` is required for Next.js initial hydration and theme initialization scripts. No `unsafe-eval` is permitted. Cloudflare Turnstile scripts are explicitly allowlisted.
- `connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com;`: Restricts network calls strictly to application origins, Supabase, and Cloudflare.
- `frame-ancestors 'none';`: Completely forbids any other website from rendering Pathixo pages inside an `<iframe>`.

---

## 3. Secret Management & PII Policy

- **No Secrets in Bundles**: Only `NEXT_PUBLIC_*` variables are exposed to the client. Secrets like `SUPABASE_SERVICE_ROLE_KEY`, `SESSION_SECRET`, `UPSTASH_REDIS_REST_TOKEN`, and `TURNSTILE_SECRET_KEY` are isolated to `src/lib/` using `import "server-only"`.
- **Zero PII Logging**: Server handlers and telemetry routes strictly omit personal identifiers (phone numbers, full names, emails) from server console logs and audit tables.
- **Git Exclusion**: `.env*` files are strictly ignored in `.gitignore`, with only [.env.example](file:///d:/pathixo/pathixo-expo/.env.example) maintained.
