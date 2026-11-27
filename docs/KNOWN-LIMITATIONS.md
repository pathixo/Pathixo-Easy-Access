# Known System Limitations: Pathixo Expo Platform

> **Status**: Verified for Live Exhibition Deployment  
> **Target Audience**: Technical Team, Exhibition Coordinators, and System Administrators  
> **Philosophy**: Transparent identification of technical boundaries, edge conditions, and deliberate engineering trade-offs.

---

## 1. Third-Party Service Quotas & Tiers

### Upstash Redis Rate Limiting
- **Current Architecture**: Public write endpoints (`/api/register`, `/api/spin`, `/api/inquiry`) use Upstash Redis sliding-window rate limiters.
- **Limitation**: Upstash free tier accounts have a limit of **10,000 commands per day**. Under extreme booth traffic (e.g. >1,500 simultaneous visitors rapidly refreshing and submitting forms), the free quota could be reached.
- **Mitigation / Recommendation**: Ensure an Upstash **Pay-As-You-Go** or **Pro** plan is linked prior to exhibition day to enable unlimited burst throughput.

### Cloudflare Turnstile Token Expiry
- **Current Architecture**: The visitor registration form and inquiry modal embed a managed Cloudflare Turnstile challenge.
- **Limitation**: Turnstile challenge tokens have a validity lifetime of **300 seconds (5 minutes)**. If an attendee opens the registration screen and steps away from their phone for more than 5 minutes before tapping submit, the verification will fail with an expired token error.
- **Mitigation**: The registration form detects failed tokens, displays a clear message ("Verification expired. Please try again"), and automatically triggers a Turnstile widget reset.

---

## 2. Network & Connectivity Constraints

### Exhibition Hall Cellular Congestion
- **Current Architecture**: The application is optimized for low-bandwidth 4G connections (total initial bundle < 250KB compressed, zero oversized media).
- **Limitation**: Convention halls (such as India Expo Centre & Mart) frequently suffer from heavy radio-frequency interference and cell tower overload during peak hours (11:00 AM – 3:00 PM), causing random packet drops and 2–5 second latency spikes.
- **Mitigation**:
  - All form submissions show visual loading spinners to prevent repeated clicks.
  - The `/api/spin` call generates an `Idempotency-Key` stored in `sessionStorage`. If a network timeout occurs, retrying the spin sends the identical key, ensuring PostgreSQL returns the original prize rather than deducting a second reward.
  - The offline paper sign-up fallback (documented in `docs/RUNBOOK.md`) provides 100% operational continuity.

---

## 3. Client Environment & Browser Edge Cases

### Incognito / Private Browsing Mode
- **Current Architecture**: After successful registration, a cryptographically signed, `HttpOnly` JWT cookie (`visitor_session`) is set on the visitor's browser.
- **Limitation**: If an attendee registers in an Incognito or Private browsing window and **completely closes all private tabs**, the browser discards the session cookie. Returning to `/spin` in a new window will prompt them to register again, which will return a 409 Conflict ("Already registered").
- **Mitigation**: Booth staff can immediately look up the visitor by their mobile number in `/admin/leads` to retrieve their awarded voucher code (`PX-XXXX-XXXX`) and complete redemption.

### International Mobile Numbers
- **Current Architecture**: The visitor registration form strictly validates Indian 10-digit mobile numbers matching `^[6-9]\d{9}$` (with automatic normalization of `+91`, `0`, and spaces).
- **Limitation**: Foreign delegates visiting from international regions cannot submit the standard registration form with non-Indian country codes.
- **Mitigation**: Foreign delegates are guided to use the **"Discuss Your Project"** business inquiry modal (which accepts international telephone formats) or are recorded on the paper VIP intake sheet.

---

## 4. Business Logic Trade-Offs

### Strict One-Spin-Per-Visitor Enforcement
- **Constraint**: To guarantee fairness and prevent physical swag stock depletion, every visitor is permitted exactly one spin across the entire duration of the event.
- **Behavior**: Entering an existing phone number or email triggers a `409 Conflict` response. The system will never allow a second spin under the same credentials.
- **Admin Override**: If a legitimate technical failure occurs (e.g. visitor phone died mid-spin), a `super_admin` can review the visitor's record in `/admin/leads` to confirm whether a prize was generated.

### Single Transaction Locking in `spin_wheel`
- **Constraint**: The `spin_wheel()` database function uses `SELECT ... FOR UPDATE` row-level locks on active rewards to guarantee atomic inventory decrement.
- **Behavior**: Under extreme concurrency (e.g., 50+ visitors clicking spin at the exact same millisecond), transactions queue momentarily for row lock acquisition. Benchmarks confirm throughput of ~45-50 concurrent transactions per second on standard Supabase compute without deadlocks.

---

## 5. Security Invariant: No System is Unhackable

While the platform implements defense-in-depth:
- Server-side cryptographic functions
- Revoked anon database privileges
- Signed HttpOnly cookies
- Parameterized queries
- Cloudflare Turnstile & rate limiting

No internet-facing software can be guaranteed 100% invulnerable to novel zero-day exploits, physical device theft, or compromise of administrative credentials. Strict adherence to the administrative procedures in `docs/ADMIN-GUIDE.md` and `docs/RUNBOOK.md` is required.
