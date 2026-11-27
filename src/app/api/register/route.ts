import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { registerSchema } from "@/lib/validation";
import { registerRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { setVisitorSessionCookie } from "@/lib/security/session";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Rate limiting (5 per min per IP)
    const rateCheck = await registerRateLimiter.limit(clientIp);
    if (!rateCheck.success) {
      return apiError(
        "RATE_LIMITED",
        "Too many registration attempts. Please wait a moment and try again.",
        429
      );
    }

    // 2. Parse and validate payload
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return apiError("INVALID_JSON", "Invalid request body format.", 400);
    }

    const parseResult = registerSchema.safeParse(rawBody);
    if (!parseResult.success) {
      const firstError = parseResult.error.errors[0]?.message || "Invalid input data";
      return apiError("VALIDATION_ERROR", firstError, 400, parseResult.error.flatten().fieldErrors);
    }

    const data = parseResult.data;

    // 3. Verify Turnstile token
    const turnstileCheck = await verifyTurnstileToken(data.turnstile_token ?? undefined, clientIp);
    if (!turnstileCheck.success) {
      return apiError(
        "BOT_VERIFICATION_FAILED",
        turnstileCheck.error || "Bot verification check failed. Please refresh.",
        400
      );
    }

    // 4. Insert into database
    const supabase = getAdminClient();
    const campaignId = process.env.CAMPAIGN_ID || "expo_mart_2026";
    const now = new Date().toISOString();

    const { data: inserted, error } = await supabase
      .from("visitors")
      .insert({
        full_name: data.full_name,
        email: data.email,
        mobile: data.mobile,
        company: data.company || null,
        designation: data.designation || null,
        interested_product: data.interested_product || null,
        message: data.message || null,
        privacy_consent: true,
        privacy_consent_at: now,
        marketing_consent: Boolean(data.marketing_consent),
        marketing_consent_at: data.marketing_consent ? now : null,
        campaign_id: campaignId,
        registration_source: "qr_booth",
        utm_source: data.utm_source || null,
        utm_medium: data.utm_medium || null,
        utm_campaign: data.utm_campaign || null,
        utm_term: data.utm_term || null,
        utm_content: data.utm_content || null,
      })
      .select("id")
      .single();

    if (error) {
      // Duplicate entry detection (PostgreSQL 23505 unique_violation)
      if (error.code === "23505") {
        return apiError(
          "DUPLICATE_REGISTRATION",
          "This phone number or email address has already been registered. Please visit our stall team if you need assistance.",
          409
        );
      }

      console.error("Database registration error:", error.message);
      return apiError("DATABASE_ERROR", "Unable to complete registration. Please try again.", 500);
    }

    if (!inserted || !inserted.id) {
      return apiError("REGISTRATION_FAILED", "Failed to create visitor profile.", 500);
    }

    // 5. Set signed HttpOnly visitor session cookie
    await setVisitorSessionCookie(inserted.id);

    // Return safe confirmation (NEVER return raw database row or PII)
    return apiSuccess({ registered: true });
  } catch (err) {
    console.error("Unhandled registration error:", err);
    return apiError("INTERNAL_SERVER_ERROR", "A server error occurred. Please try again.", 500);
  }
}
