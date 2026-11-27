import { NextRequest } from "next/server";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { executeDevSpin, getDevStore } from "@/lib/dev-store";
import { clearVisitorSessionCookie, getVisitorSession } from "@/lib/security/session";
import { spinRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { apiError, apiSuccess } from "@/lib/security/errors";
import { sendVoucherEmail } from "@/lib/email/send-voucher";

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

    // 4. Local Dev Mode Fallback when Supabase is not configured
    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      const outcome = executeDevSpin(session.visitorId, idempotencyKey.trim());
      if (!outcome.ok) {
        if (outcome.error?.code === "VISITOR_NOT_FOUND") {
          await clearVisitorSessionCookie();
          return apiError(
            "UNAUTHORIZED",
            "Your session has expired. Please register again.",
            401
          );
        }
        return apiError(
          outcome.error?.code || "SPIN_FAILED",
          outcome.error?.message || "Unable to complete spin",
          400
        );
      }
      if (outcome.spin_id && !outcome.already_spun) {
        const store = getDevStore();
        const visitor = store.visitors.find((v) => v.id === session.visitorId);
        if (visitor) {
          sendVoucherEmail({
            toEmail: visitor.email,
            toName: visitor.full_name,
            prizeName: outcome.reward_name || "Exhibition Voucher",
            voucherCode: outcome.reward_code || "",
            redemptionInstructions: outcome.redemption_instructions || "",
            expiresAt: outcome.expires_at || new Date().toISOString(),
          })
            .then((res) => {
              const s = store.spins.find((x) => x.id === outcome.spin_id);
              if (s) {
                s.email_status = res.success ? "sent" : "not_configured";
                s.email_error = res.error || null;
              }
            })
            .catch(() => {});
        }
      }
      return apiSuccess(outcome);
    }

    // 5. Invoke cryptographic spin_wheel RPC
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

      if (code === "VISITOR_NOT_FOUND") {
        await clearVisitorSessionCookie();
        return apiError(
          "UNAUTHORIZED",
          "Your session has expired. Please register again.",
          401
        );
      }

      return apiError(code, message, 400);
    }

    // 6. Asynchronously dispatch voucher delivery email without blocking user response
    if (data.spin_id && !data.already_spun) {
      (async () => {
        try {
          const { data: visitor } = await supabase
            .from("visitors")
            .select("full_name, email")
            .eq("id", session.visitorId)
            .maybeSingle();

          if (visitor && visitor.email) {
            const emailResult = await sendVoucherEmail({
              toEmail: visitor.email,
              toName: visitor.full_name,
              prizeName: data.reward_name,
              voucherCode: data.reward_code,
              redemptionInstructions: data.redemption_instructions,
              expiresAt: data.expires_at,
            });

            await supabase
              .from("spins")
              .update({
                email_status: emailResult.success ? "sent" : "failed",
                email_error: emailResult.error || null,
              })
              .eq("id", data.spin_id);
          }
        } catch (emailErr) {
          console.error("Voucher email background error:", emailErr);
        }
      })().catch(() => {});
    }

    // 7. Return spin outcome
    return apiSuccess(data);
  } catch (err) {
    console.error("Unhandled spin endpoint error:", err);
    return apiError("INTERNAL_SERVER_ERROR", "A server error occurred. Please try again.", 500);
  }
}
