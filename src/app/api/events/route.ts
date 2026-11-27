import { NextRequest } from "next/server";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { eventSchema } from "@/lib/validation";
import { eventsRateLimiter, getClientIp } from "@/lib/security/rate-limit";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);

    // 1. Rate limiting (60 per min per IP)
    const rateCheck = await eventsRateLimiter.limit(clientIp);
    if (!rateCheck.success) {
      return apiError("RATE_LIMITED", "Too many telemetry events.", 429);
    }

    // 2. Parse and validate payload
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      return apiError("INVALID_JSON", "Invalid request body.", 400);
    }

    const parseResult = eventSchema.safeParse(rawBody);
    if (!parseResult.success) {
      return apiError("VALIDATION_ERROR", "Invalid telemetry event payload.", 400);
    }

    const { event_type, product_slug, metadata } = parseResult.data;

    // 3. Store anonymous telemetry
    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      return apiSuccess({ recorded: true, dev_mode: true });
    }

    if (!isSupabaseConfigured()) {
      return apiError("SERVICE_UNAVAILABLE", "Telemetry service is not configured.", 503);
    }

    const supabase = getAdminClient();

    // Fire-and-forget DB insertion
    await supabase.from("product_events").insert({
      event_type,
      product_slug: product_slug || null,
      metadata: metadata || {},
    });

    return apiSuccess({ recorded: true });
  } catch (err) {
    console.error("Unhandled events error:", err);
    return apiError("INTERNAL_SERVER_ERROR", "Failed to record event.", 500);
  }
}
