import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
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

    // 2. Fetch existing spin for this visitor
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
