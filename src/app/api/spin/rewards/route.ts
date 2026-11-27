import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

interface PublicReward {
  slug: string;
  name: string;
  display_label: string | null;
}

/**
 * Public, read-only list of prizes that are currently active in the draw.
 * The wheel renders exactly these segments so the pointer always lands on the
 * prize the server actually allocated.
 */
export async function GET() {
  try {
    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      const rewards: PublicReward[] = getDevStore()
        .rewards.filter((reward) => reward.is_active)
        .map((reward) => ({
          slug: reward.slug,
          name: reward.name,
          display_label: reward.display_label,
        }));

      return apiSuccess(rewards);
    }

    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("rewards")
      .select("slug, name, display_label")
      .eq("is_active", true)
      .order("id", { ascending: true });

    if (error) {
      console.error("Fetch active rewards error:", error.message);
      return apiError("DATABASE_ERROR", "Unable to load the prize pool.", 500);
    }

    return apiSuccess((data ?? []) as PublicReward[]);
  } catch (err) {
    console.error("Unhandled rewards endpoint error:", err);
    return apiError("INTERNAL_SERVER_ERROR", "Unable to load the prize pool.", 500);
  }
}
