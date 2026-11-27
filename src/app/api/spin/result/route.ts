import { NextRequest } from "next/server";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
import { getVisitorSession } from "@/lib/security/session";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    // 1. Validate visitor session from signed cookie
    const session = await getVisitorSession();
    if (!session || !session.visitorId) {
      return apiError(
        "UNAUTHORIZED",
        "You must register to view your lucky draw status.",
        401
      );
    }

    // 2. Local Dev Mode Fallback when Supabase is not configured
    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      const store = getDevStore();
      const spin = store.spins.find((s) => s.visitor_id === session.visitorId);
      if (!spin) {
        return apiError("NO_SPIN_FOUND", "No lucky draw participation record found for this session.", 404);
      }
      const rew = store.rewards.find((r) => r.id === spin.reward_id);
      return apiSuccess({
        spin_id: spin.id,
        reward_code: spin.reward_code,
        redemption_status: spin.redemption_status,
        email_status: spin.email_status,
        fulfillment_status: spin.fulfillment_status,
        expires_at: spin.expires_at,
        created_at: spin.created_at,
        reward: rew || null,
      });
    }

    // 3. Fetch existing spin for this visitor
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("spins")
      .select(`
        id,
        reward_code,
        redemption_status,
        expires_at,
        created_at,
        rewards (
          id,
          slug,
          name,
          description,
          reward_type,
          redemption_instructions
        )
      `)
      .eq("visitor_id", session.visitorId)
      .maybeSingle();

    if (error) {
      console.error("Fetch spin result error:", error.message);
      return apiError("DATABASE_ERROR", "Failed to retrieve spin status.", 500);
    }

    if (!data) {
      return apiError("NO_SPIN_FOUND", "No lucky draw participation record found for this session.", 404);
    }

    const reward = Array.isArray(data.rewards) ? data.rewards[0] : data.rewards;

    return apiSuccess({
      spin_id: data.id,
      reward_code: data.reward_code,
      redemption_status: data.redemption_status,
      expires_at: data.expires_at,
      created_at: data.created_at,
      reward: reward || null,
    });
  } catch (err) {
    console.error("Unhandled spin result error:", err);
    return apiError("INTERNAL_SERVER_ERROR", "A server error occurred.", 500);
  }
}
