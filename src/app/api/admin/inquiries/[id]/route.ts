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
    const admin = await requireAdmin(["super_admin", "admin"]);
    const inquiryId = params.id;
    const body = await req.json();

    const allowedStatuses = ["new", "contacted", "qualified", "in_discussion", "converted", "closed"];
    if (body.lead_status && !allowedStatuses.includes(body.lead_status)) {
      return apiError("INVALID_STATUS", "Invalid lead status.", 400);
    }

    const serviceClient = getAdminClient();
    const updateData: Record<string, unknown> = {};
    if (body.lead_status) updateData.lead_status = body.lead_status;
    if (body.notes !== undefined) updateData.notes = body.notes;

    const { data: updated, error } = await serviceClient
      .from("business_inquiries")
      .update(updateData)
      .eq("id", inquiryId)
      .select()
      .single();

    if (error) {
      return apiError("DATABASE_ERROR", "Failed to update inquiry.", 500);
    }

    await logAuditEvent(
      admin.id,
      "update_inquiry",
      "business_inquiries",
      inquiryId,
      { changes: updateData },
      req.headers.get("x-forwarded-for")
    );

    return apiSuccess(updated);
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return apiError("FORBIDDEN", "You do not have permission to modify inquiries.", 403);
    }
    return apiError("UNAUTHORIZED", "Authentication required.", 401);
  }
}
