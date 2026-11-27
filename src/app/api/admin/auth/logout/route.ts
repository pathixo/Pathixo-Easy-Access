import { createAdminServerClient } from "@/lib/admin/server-client";
import { apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function POST() {
  const supabase = createAdminServerClient();
  await supabase.auth.signOut();
  return apiSuccess({ loggedOut: true });
}
