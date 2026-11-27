import { createAdminServerClient } from "@/lib/admin/server-client";
import { clearAdminSessionCookie } from "@/lib/admin/session";
import { isSupabaseConfigured } from "@/lib/supabase/admin";
import { apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function POST() {
  await clearAdminSessionCookie();

  if (isSupabaseConfigured()) {
    try {
      const supabase = createAdminServerClient();
      await supabase.auth.signOut();
    } catch {
      // Ignore when no Supabase auth session exists.
    }
  }

  return apiSuccess({ loggedOut: true });
}
