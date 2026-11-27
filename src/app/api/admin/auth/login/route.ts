import { NextRequest } from "next/server";
import { createAdminServerClient } from "@/lib/admin/server-client";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { isSuperAdminCredential, setAdminSessionCookie } from "@/lib/admin/session";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? body?.username ?? "").trim();
    const password = String(body?.password ?? "");

    if (!email || !password) {
      return apiError("MISSING_CREDENTIALS", "Username/email and password are required.", 400);
    }

    // Built-in super admin credentials for booth operations.
    if (isSuperAdminCredential(email, password)) {
      await setAdminSessionCookie();
      return apiSuccess({
        admin: {
          id: "super-admin-local",
          email: "admin@pathixo.local",
          role: "super_admin",
          full_name: "System Administrator",
        },
      });
    }

    // Dev/no-Supabase mode: allow local access so the dashboard can be tested.
    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      return apiError("INVALID_CREDENTIALS", "Invalid username or password.", 401);
    }

    const supabase = createAdminServerClient();

    // 1. Authenticate with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });

    if (authError || !authData.user) {
      return apiError("INVALID_CREDENTIALS", "Invalid email or password.", 401);
    }

    // 2. Verify admin role in admins table
    const serviceClient = getAdminClient();
    const { data: adminRow, error: adminErr } = await serviceClient
      .from("admins")
      .select("id, email, role, full_name")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (adminErr || !adminRow) {
      // User is not an authorized administrator
      await supabase.auth.signOut();
      return apiError("FORBIDDEN", "This account is not authorized as an administrator.", 403);
    }

    // 3. Log audit event
    await serviceClient.from("audit_logs").insert({
      admin_id: adminRow.id,
      action: "admin_login",
      entity_type: "auth",
      details: { email: adminRow.email, role: adminRow.role },
      ip_address: req.headers.get("x-forwarded-for") || "127.0.0.1",
    });

    return apiSuccess({
      admin: adminRow,
    });
  } catch (err) {
    console.error("Admin login error:", err);
    return apiError("INTERNAL_ERROR", "Login failed. Please retry.", 500);
  }
}
