import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { getVisitorSession } from "@/lib/security/session";
import { spinRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Rate limiting (10 per min per IP)
    const rateCheck = await spinRateLimiter.limit(clientIp);
    if (!rateCheck.success) {
      return apiError(
        "RATE_LIMITED",
        "Too many requests. Please wait a moment before spinning again.",
        429
      );
    }

    // 2. Validate visitor session from signed cookie
    const session = await getVisitorSession();
    if (!session || !session.visitorId) {
      return apiError(
        "UNAUTHORIZED",
        "You must register before participating in the lucky draw.",
        401
      );
    }

    // 3. Require Idempotency-Key header
    const idempotencyKey = req.headers.get("Idempotency-Key") || req.headers.get("idempotency-key");
    if (!idempotencyKey || idempotencyKey.trim().length < 8) {
      return apiError(
        "MISSING_IDEMPOTENCY_KEY",
        "Missing or invalid Idempotency-Key header.",
        400
      );
    }

    // 4. Invoke cryptographic spin_wheel RPC
    const supabase = getAdminClient();
    const { data, error } = await supabase.rpc("spin_wheel", {
      p_visitor_id: session.visitorId,
      p_idempotency_key: idempotencyKey.trim(),
    });

    if (error) {
      console.error("Database spin_wheel error:", error.message);
      return apiError(
        "SPIN_ERROR",
        "Unable to execute lucky draw at this time. Please retry.",
        500
      );
    }

    if (!data || data.ok === false) {
      const code = data?.error?.code || "SPIN_FAILED";
      const message = data?.error?.message || "Lucky draw allocation could not be completed.";
      return apiError(code, message, 400);
    }

    // 5. Return spin outcome
    return apiSuccess(data);
  } catch (err) {
    console.error("Unhandled spin endpoint error:", err);
    return apiError("INTERNAL_SERVER_ERROR", "A server error occurred. Please try again.", 500);
  }
}
