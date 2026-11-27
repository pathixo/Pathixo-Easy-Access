import { NextRequest } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { inquirySchema } from "@/lib/validation";
import { inquiryRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { verifyTurnstileToken } from "@/lib/security/turnstile";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Rate limiting (5 per min per IP)
    const rateCheck = await inquiryRateLimiter.limit(clientIp);
    if (!rateCheck.success) {
      return apiError(
        "RATE_LIMITED",
        "Too many inquiry submissions. Please wait a moment and try again.",
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

    const parseResult = inquirySchema.safeParse(rawBody);
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
        turnstileCheck.error || "Bot verification check failed.",
        400
      );
    }

    // 4. Insert into business_inquiries
    const supabase = getAdminClient();
    const { error } = await supabase.from("business_inquiries").insert({
      full_name: data.full_name,
      email: data.email,
      mobile: data.mobile,
      company: data.company || null,
      service_needed: data.service_needed || null,
      project_description: data.project_description,
      estimated_budget: data.estimated_budget || null,
      lead_status: "new",
    });

    if (error) {
      console.error("Database inquiry error:", error.message);
      return apiError("DATABASE_ERROR", "Failed to submit project inquiry.", 500);
    }

    return apiSuccess({ submitted: true });
  } catch (err) {
    console.error("Unhandled inquiry error:", err);
    return apiError("INTERNAL_SERVER_ERROR", "A server error occurred. Please try again.", 500);
  }
}
