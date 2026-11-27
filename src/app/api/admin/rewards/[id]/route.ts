import { NextRequest } from "next/server";
import { requireAdmin, logAuditEvent } from "@/lib/admin/auth";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(["super_admin"]);
    const rewardId = params.id;
    const body = await req.json();

    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      const store = getDevStore();
      const target = store.rewards.find((r) => r.id === rewardId);
      if (!target) {
        return apiError("NOT_FOUND", "Reward not found.", 404);
      }
      if (body.name !== undefined) target.name = String(body.name).trim();
      if (body.display_label !== undefined) target.display_label = String(body.display_label).trim();
      if (body.description !== undefined) target.description = String(body.description).trim();
      if (body.redemption_instructions !== undefined) target.redemption_instructions = String(body.redemption_instructions).trim();
      if (body.remaining_inventory !== undefined) target.remaining_inventory = Number(body.remaining_inventory);
      if (body.total_inventory !== undefined) target.total_inventory = Number(body.total_inventory);
      if (body.max_cap !== undefined) {
        target.max_cap = body.max_cap === null || body.max_cap === "" ? null : Number(body.max_cap);
      }
      if (body.probability_weight !== undefined) target.probability_weight = Number(body.probability_weight);
      if (body.is_active !== undefined) target.is_active = Boolean(body.is_active);
      if (body.expiry_days !== undefined) target.expiry_days = Number(body.expiry_days);
      return apiSuccess(target);
    }

    const serviceClient = getAdminClient();

    // Fetch existing values for audit log
    const { data: oldReward } = await serviceClient
      .from("rewards")
      .select("*")
      .eq("id", rewardId)
      .single();

    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) updateData.name = String(body.name).trim();
    if (body.display_label !== undefined) updateData.display_label = String(body.display_label).trim();
    if (body.description !== undefined) updateData.description = String(body.description).trim();
    if (body.redemption_instructions !== undefined) updateData.redemption_instructions = String(body.redemption_instructions).trim();
    if (body.remaining_inventory !== undefined) updateData.remaining_inventory = Number(body.remaining_inventory);
    if (body.total_inventory !== undefined) updateData.total_inventory = Number(body.total_inventory);
    if (body.max_cap !== undefined) {
      updateData.max_cap = body.max_cap === null || body.max_cap === "" ? null : Number(body.max_cap);
    }
    if (body.probability_weight !== undefined) updateData.probability_weight = Number(body.probability_weight);
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);
    if (body.expiry_days !== undefined) updateData.expiry_days = Number(body.expiry_days);

    const { data: updated, error } = await serviceClient
      .from("rewards")
      .update(updateData)
      .eq("id", rewardId)
      .select()
      .single();

    if (error) {
      return apiError("DATABASE_ERROR", error.message, 500);
    }

    await logAuditEvent(
      admin.id,
      "update_reward_definition",
      "rewards",
      rewardId,
      { old: oldReward, new: updated },
      req.headers.get("x-forwarded-for")
    );

    return apiSuccess(updated);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return apiError("FORBIDDEN", "Only Super Admins may modify reward definitions.", 403);
    }
    return apiError("UNAUTHORIZED", "Authentication required.", 401);
  }
}
