import { NextRequest } from "next/server";
import { requireAdmin, logAuditEvent } from "@/lib/admin/auth";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
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

    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      const store = getDevStore();
      const spin = store.spins.find((s) => s.reward_code === cleanCode);
      if (!spin) {
        return apiError("CODE_NOT_FOUND", "Voucher code not found in system.", 404);
      }
      if (spin.redemption_status === "redeemed") {
        return apiError(
          "ALREADY_REDEEMED",
          `This voucher was already marked redeemed on ${spin.redeemed_at}`,
          400
        );
      }
      const now = new Date().toISOString();
      spin.redemption_status = "redeemed";
      spin.fulfillment_status = "redeemed_at_booth";
      spin.redeemed_at = now;
      const visitor = store.visitors.find((v) => v.id === spin.visitor_id);
      const reward = store.rewards.find((r) => r.id === spin.reward_id);
      return apiSuccess({
        redeemed: true,
        redeemed_at: now,
        spin,
        visitor: visitor || { full_name: spin.user_name, email: spin.user_email, mobile: spin.user_phone },
        reward: reward || { name: spin.prize_label },
      });
    }

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

    // 3. Mark as redeemed atomically
    const now = new Date().toISOString();
    const { data: updated, error: updateErr } = await serviceClient
      .from("spins")
      .update({
        redemption_status: "redeemed",
        fulfillment_status: "redeemed_at_booth",
        redeemed_at: now,
        redeemed_by: admin.id,
      })
      .eq("id", spinRecord.id)
      .eq("redemption_status", "not_redeemed")
      .select()
      .maybeSingle();

    if (updateErr) {
      return apiError("DATABASE_ERROR", "Failed to update redemption status.", 500);
    }

    if (!updated) {
      const { data: latest } = await serviceClient
        .from("spins")
        .select("redemption_status, redeemed_at")
        .eq("id", spinRecord.id)
        .maybeSingle();

      if (latest?.redemption_status === "redeemed") {
        return apiError(
          "ALREADY_REDEEMED",
          `This voucher was already marked redeemed on ${latest.redeemed_at}`,
          400,
          { spinRecord }
        );
      }

      return apiError("REDEEM_CONFLICT", "Voucher could not be redeemed. Please retry.", 409);
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
