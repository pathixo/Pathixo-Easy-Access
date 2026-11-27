import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      return apiSuccess([]);
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("products")
      .select("id, slug, name, tagline, description, key_features, destination_url, badge_text, launch_status, display_order")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      console.error("Database products error:", error.message);
      return apiError("DATABASE_ERROR", "Unable to load product catalog.", 500);
    }

    return apiSuccess(data || []);
  } catch (err) {
    console.error("Unhandled products error:", err);
    return apiError("INTERNAL_SERVER_ERROR", "A server error occurred.", 500);
  }
}
