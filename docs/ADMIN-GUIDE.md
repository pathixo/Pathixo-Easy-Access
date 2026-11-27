# PATHIXO EXPO PLATFORM — ADMIN USER & OPERATIONS GUIDE

This guide provides instructions for the Pathixo booth team, event coordinators, and leadership managing the digital exhibition platform.

---

## 1. Initial Account Provisioning

Public registration for admin accounts is strictly disabled. Administrators are pre-provisioned via the secure server CLI script using the `SUPABASE_SERVICE_ROLE_KEY`.

### Command Syntax:
```bash
node scripts/create-admin.mjs <email> <password> [role] [fullName]
```

### Roles Available:
| Role | Permissions |
|---|---|
| `super_admin` | Full control: edit reward inventories and probability weights, manage products, view audit logs, export CSVs, mark redemptions. |
| `admin` | Operations control: triage business inquiry statuses, look up and mark stall vouchers redeemed, view dashboard and leads, export CSVs. |
| `viewer` | Read-only access: view dashboard, leads table, inquiries, and audit logs. Mutation actions are blocked (403 Forbidden). |

### Example (Provision Founder Account):
```bash
node scripts/create-admin.mjs founder@pathixo.com StrongPassword123# super_admin "Abhijeet Jha"
```

---

## 2. Accessing the Admin Portal

- **URL**: `https://<your-domain>/admin/login` (or `http://localhost:3000/admin/login` in development)
- **Security Protections**:
  - Automatically tagged with `X-Robots-Tag: noindex, nofollow` to prevent search engine indexing.
  - Edge middleware redirects unauthenticated requests.
  - Secondary server-side session checks verify the admin profile in the database on every page.
  - Asia/Kolkata (`IST`) display timezone across all views.

---

## 3. Daily Booth Operations

### A. Lucky Draw Voucher Verification & Redemption (`/admin/lucky-draw`)
When an attendee presents their voucher code (`PX-XXXX-XXXX`) at the booth:
1. Navigate to **Lucky Draw & Redeem** in the sidebar.
2. Enter or paste the 8-character code into the **Stall Voucher Quick-Redeem** input.
3. Click **"Verify & Redeem"**.
4. The system validates:
   - Authenticity of the code against the `spins` table.
   - Whether the code was previously claimed (returns alert if already redeemed).
   - Displays attendee name, mobile, and prize won.
5. If valid, the voucher is marked `redeemed` with timestamp and the logged-in admin's ID is stored.

### B. Leads & Visitors Management (`/admin/leads`)
- Search by attendee name, email, or mobile number.
- Filter by product interest (Vakxo, Crock PDF, Custom Engineering).
- View whether the visitor has spun the wheel and what prize was assigned.
- Click **"Export Leads CSV"** to download a backup.

### C. Business Inquiries & RFPs (`/admin/inquiries`)
- Review submitted custom software development requests.
- Update pipeline status via the dropdown:
  `new` $\rightarrow$ `contacted` $\rightarrow$ `qualified` $\rightarrow$ `in_discussion` $\rightarrow$ `converted` $\rightarrow$ `closed`.
- Each status update is logged in the `audit_logs` table.

---

## 4. Secure Data Exports (CSV)

- Exports are restricted to `admin` and `super_admin` roles.
- **CSV Formula Injection Neutralization**: Any cell starting with dangerous characters (`=`, `+`, `-`, `@`) is automatically prefixed with a `'` quote to prevent spreadsheet code execution.
- Every export action records an entry in `audit_logs` noting who exported, the row count, and the client IP address.

---

## 5. Security Audit Log Viewer (`/admin/audit-logs`)

Super Admins and Admins can inspect the system audit trail to review staff actions, authentication timestamps, status modifications, voucher redemptions, and data exports.
