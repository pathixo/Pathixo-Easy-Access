import { NextRequest } from "next/server";
import crypto from "crypto";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
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

    // 4. Local Dev Mode Fallback when Supabase is not yet configured
    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      const store = getDevStore();
      // Require BOTH identifiers to match. Matching on either one alone would
      // let someone who knows a phone number or email open another visitor's
      // voucher. The real flow needs both, exactly as the visitor typed them.
      const existing = store.visitors.find(
        (v) => v.mobile === data.mobile && v.email.toLowerCase() === data.email.toLowerCase()
      );

      if (existing) {
        await setVisitorSessionCookie(existing.id);
        const existingSpin = store.spins.find((s) => s.visitor_id === existing.id);
        if (existingSpin) {
          const rew = store.rewards.find((r) => r.id === existingSpin.reward_id);
          return apiSuccess({
            registered: true,
            already_registered: true,
            already_spun: true,
            full_name: existing.full_name,
            spin: {
              spin_id: existingSpin.id,
              reward_id: existingSpin.reward_id,
              reward_code: existingSpin.reward_code,
              reward_name: rew?.name || existingSpin.prize_label,
              display_label: rew?.display_label || rew?.name || existingSpin.prize_label,
              reward_slug: rew?.slug || "vip-expo-pass",
              reward_type: rew?.reward_type || "no_prize",
              reward_description: rew?.description || "Exhibition Lucky Draw Voucher",
              redemption_instructions: rew?.redemption_instructions || "Show this code to our stall team.",
              expires_at: existingSpin.expires_at,
              email_status: existingSpin.email_status,
              fulfillment_status: existingSpin.fulfillment_status,
            },
          });
        }
        return apiSuccess({
          registered: true,
          already_registered: true,
          already_spun: false,
          full_name: existing.full_name,
        });
      }

      const newId = crypto.randomUUID();
      store.visitors.unshift({
        id: newId,
        full_name: data.full_name,
        email: data.email,
        mobile: data.mobile,
        created_at: new Date().toISOString(),
      });
      await setVisitorSessionCookie(newId);
      return apiSuccess({ registered: true });
    }

    // 5. Insert into database
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
      // Duplicate entry detection: Returning visitor flow
      if (error.code === "23505") {
        try {
          // Both identifiers must match. Never hand out an existing voucher to
          // someone who only knows a phone number or an email address.
          const { data: existingVisitor } = await supabase
            .from("visitors")
            .select("id, full_name, mobile, email")
            .eq("mobile", data.mobile)
            .eq("email", data.email)
            .limit(1)
            .maybeSingle();

          if (existingVisitor) {
            await setVisitorSessionCookie(existingVisitor.id);

            const { data: existingSpin } = await supabase
              .from("spins")
              .select("id, reward_id, reward_code, expires_at, redemption_status, fulfillment_status, email_status, rewards(name, display_label, slug, description, reward_type, redemption_instructions)")
              .eq("visitor_id", existingVisitor.id)
              .maybeSingle();

            if (existingSpin) {
              const r = Array.isArray(existingSpin.rewards) ? existingSpin.rewards[0] : existingSpin.rewards;
              return apiSuccess({
                registered: true,
                already_registered: true,
                already_spun: true,
                full_name: existingVisitor.full_name,
                spin: {
                  spin_id: existingSpin.id,
                  reward_id: existingSpin.reward_id,
                  reward_code: existingSpin.reward_code,
                  reward_name: r?.name || "Exhibition Voucher",
                  display_label: r?.display_label || r?.name || "Exhibition Voucher",
                  reward_slug: r?.slug || "vip-expo-pass",
                  reward_type: r?.reward_type || "no_prize",
                  reward_description: r?.description || "Exhibition Lucky Draw Voucher",
                  redemption_instructions: r?.redemption_instructions || "Show this code to our stall team.",
                  expires_at: existingSpin.expires_at,
                  email_status: existingSpin.email_status,
                  fulfillment_status: existingSpin.fulfillment_status,
                },
              });
            }

            return apiSuccess({
              registered: true,
              already_registered: true,
              already_spun: false,
              full_name: existingVisitor.full_name,
            });
          }
        } catch (lookupErr) {
          console.error("Existing visitor lookup failed:", lookupErr);
        }

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
