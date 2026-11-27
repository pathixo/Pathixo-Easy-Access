import { NextRequest } from "next/server";
import { requireAdmin, logAuditEvent } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(["super_admin", "admin"]);
    const { reward_code } = await req.json();

    if (!reward_code || typeof reward_code !== "string") {
      return apiError("INVALID_CODE", "Valid voucher code is required.", 400);
    }

    const cleanCode = reward_code.trim().toUpperCase();
    const serviceClient = getAdminClient();

    // 1. Fetch spin record with reward and visitor info
    const { data: spinRecord, error: fetchErr } = await serviceClient
      .from("spins")
      .select(`
        id,
        reward_code,
        redemption_status,
        redeemed_at,
        expires_at,
        visitor_id,
        visitors (full_name, email, mobile, company),
        rewards (name, slug, reward_type, redemption_instructions)
      `)
      .eq("reward_code", cleanCode)
      .maybeSingle();

    if (fetchErr || !spinRecord) {
      return apiError("CODE_NOT_FOUND", "Voucher code not found in system.", 404);
    }

    // 2. Check if already redeemed
    if (spinRecord.redemption_status === "redeemed") {
      return apiError(
        "ALREADY_REDEEMED",
        `This voucher was already marked redeemed on ${spinRecord.redeemed_at}`,
        400,
        { spinRecord }
      );
    }

    // 3. Mark as redeemed
    const now = new Date().toISOString();
    const { data: updated, error: updateErr } = await serviceClient
      .from("spins")
      .update({
        redemption_status: "redeemed",
        redeemed_at: now,
        redeemed_by: admin.id,
      })
      .eq("id", spinRecord.id)
      .select()
      .single();

    if (updateErr) {
      return apiError("DATABASE_ERROR", "Failed to update redemption status.", 500);
    }

    // 4. Log audit event
    await logAuditEvent(
      admin.id,
      "redeem_voucher",
      "spins",
      spinRecord.id,
      { reward_code: cleanCode, visitor_id: spinRecord.visitor_id },
      req.headers.get("x-forwarded-for")
    );

    return apiSuccess({
      redeemed: true,
      redeemed_at: now,
      spin: updated,
      visitor: spinRecord.visitors,
      reward: spinRecord.rewards,
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return apiError("FORBIDDEN", "Viewers cannot redeem vouchers.", 403);
    }
    return apiError("UNAUTHORIZED", "Authentication required.", 401);
  }
}
