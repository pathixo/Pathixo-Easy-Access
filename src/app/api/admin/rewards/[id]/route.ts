import { NextRequest } from "next/server";
import { requireAdmin, logAuditEvent } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/supabase/admin";
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

    const serviceClient = getAdminClient();

    // Fetch existing values for audit log
    const { data: oldReward } = await serviceClient
      .from("rewards")
      .select("*")
      .eq("id", rewardId)
      .single();

    const updateData: Record<string, unknown> = {};
    if (body.remaining_inventory !== undefined) updateData.remaining_inventory = body.remaining_inventory;
    if (body.total_inventory !== undefined) updateData.total_inventory = body.total_inventory;
    if (body.probability_weight !== undefined) updateData.probability_weight = body.probability_weight;
    if (body.is_active !== undefined) updateData.is_active = Boolean(body.is_active);

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
