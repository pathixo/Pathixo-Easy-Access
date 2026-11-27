import "server-only";
import { createAdminServerClient } from "./server-client";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";

export type AdminRole = "super_admin" | "admin" | "viewer";

export interface AdminProfile {
  id: string;
  email: string;
  role: AdminRole;
  full_name: string | null;
}

/**
 * Retrieves the currently authenticated admin user and their assigned role
 */
export async function getAdminSession(): Promise<AdminProfile | null> {
  try {
    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      return {
        id: "dev-admin-local",
        email: "admin@pathixo.com",
        role: "super_admin",
        full_name: "System Administrator",
      };
    }

    const supabase = createAdminServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    // Query admins table with service role client to prevent any RLS issues
    const serviceClient = getAdminClient();
    const { data: adminRow, error: adminErr } = await serviceClient
      .from("admins")
      .select("id, email, role, full_name")
      .eq("id", user.id)
      .maybeSingle();

    if (adminErr || !adminRow) {
      return null;
    }

    return {
      id: adminRow.id,
      email: adminRow.email,
      role: adminRow.role as AdminRole,
      full_name: adminRow.full_name,
    };
  } catch {
    return null;
  }
}

/**
 * Server-side guard to enforce valid admin session and specific roles
 */
export async function requireAdmin(
  allowedRoles?: AdminRole[]
): Promise<AdminProfile> {
  const profile = await getAdminSession();

  if (!profile) {
    throw new Error("UNAUTHORIZED");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
    throw new Error("FORBIDDEN");
  }

  return profile;
}

/**
 * Records an entry into the audit_logs table
 */
export async function logAuditEvent(
  adminId: string,
  action: string,
  entityType: string,
  entityId?: string | null,
  details: Record<string, unknown> = {},
  ipAddress?: string | null
): Promise<void> {
  try {
    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      return;
    }

    const serviceClient = getAdminClient();
    await serviceClient.from("audit_logs").insert({
      admin_id: adminId,
      action,
      entity_type: entityType,
      entity_id: entityId || null,
      details,
      ip_address: ipAddress || null,
    });
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
}
