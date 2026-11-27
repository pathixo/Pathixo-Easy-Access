import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAuditEvent } from "@/lib/admin/auth";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
import { buildCsv, formatKolkataTime } from "@/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(["super_admin", "admin"]);

    const headers = [
      "Inquiry ID",
      "Full Name",
      "Email",
      "Mobile",
      "Company",
      "Service Category",
      "Project Description",
      "Estimated Budget",
      "Lead Status",
      "Staff Notes",
      "Submission Time (IST)",
    ];

    let rows: (string | number | boolean | null | undefined)[][] = [];

    if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
      rows = getDevStore().inquiries.map((iq) => [
        iq.id,
        iq.full_name,
        iq.email,
        iq.mobile,
        iq.company || "N/A",
        iq.service_needed || "General",
        iq.project_description,
        iq.estimated_budget || "Not Specified",
        iq.lead_status,
        iq.notes || "",
        formatKolkataTime(iq.created_at),
      ]);
    } else {
      const serviceClient = getAdminClient();
      const { data: inquiries, error } = await serviceClient
        .from("business_inquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (error || !inquiries) {
        return NextResponse.json({ ok: false, error: "Failed to fetch inquiries" }, { status: 500 });
      }

      rows = inquiries.map((iq) => [
        iq.id,
        iq.full_name,
        iq.email,
        iq.mobile,
        iq.company || "N/A",
        iq.service_needed || "General",
        iq.project_description,
        iq.estimated_budget || "Not Specified",
        iq.lead_status,
        iq.notes || "",
        formatKolkataTime(iq.created_at),
      ]);
    }

    const csvContent = buildCsv(headers, rows);

    await logAuditEvent(
      admin.id,
      "export_inquiries_csv",
      "business_inquiries",
      null,
      { row_count: rows.length },
      req.headers.get("x-forwarded-for")
    );

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pathixo-inquiries-${dateStr}.csv"`,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "Forbidden: Viewers cannot export data." }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}
