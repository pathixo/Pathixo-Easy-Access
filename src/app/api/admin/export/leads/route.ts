import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, logAuditEvent } from "@/lib/admin/auth";
import { getAdminClient } from "@/lib/supabase/admin";
import { buildCsv, formatKolkataTime } from "@/lib/admin/utils";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(["super_admin", "admin"]);
    const serviceClient = getAdminClient();

    // Fetch all leads with their spin data
    const { data: leads, error } = await serviceClient
      .from("visitors")
      .select(`
        id,
        full_name,
        email,
        mobile,
        company,
        designation,
        interested_product,
        privacy_consent,
        privacy_consent_at,
        marketing_consent,
        utm_source,
        utm_campaign,
        created_at,
        spins (
          reward_code,
          redemption_status,
          redeemed_at,
          rewards (name)
        )
      `)
      .order("created_at", { ascending: false });

    if (error || !leads) {
      return NextResponse.json({ ok: false, error: "Failed to fetch leads" }, { status: 500 });
    }

    // Headers
    const headers = [
      "Visitor ID",
      "Full Name",
      "Email",
      "Mobile",
      "Company",
      "Designation",
      "Product Interest",
      "Privacy Consent",
      "Consent Time (IST)",
      "Marketing Consent",
      "UTM Source",
      "UTM Campaign",
      "Registration Time (IST)",
      "Voucher Code",
      "Reward Won",
      "Redemption Status",
      "Redeemed Time (IST)",
    ];

    // Rows with CSV injection escape
    const rows = leads.map((v) => {
      const spin = (Array.isArray(v.spins) ? v.spins[0] : v.spins) as {
        reward_code?: string;
        redemption_status?: string;
        redeemed_at?: string;
        rewards?: { name?: string } | { name?: string }[];
      } | null;

      const rewardData = spin?.rewards;
      const rewardName = Array.isArray(rewardData)
        ? rewardData[0]?.name
        : rewardData?.name || "None";

      return [
        v.id,
        v.full_name,
        v.email,
        v.mobile,
        v.company || "N/A",
        v.designation || "N/A",
        v.interested_product || "General",
        v.privacy_consent ? "YES" : "NO",
        formatKolkataTime(v.privacy_consent_at),
        v.marketing_consent ? "YES" : "NO",
        v.utm_source || "direct",
        v.utm_campaign || "none",
        formatKolkataTime(v.created_at),
        spin?.reward_code || "Not Spun",
        rewardName || "None",
        spin?.redemption_status || "N/A",
        formatKolkataTime(spin?.redeemed_at),
      ];
    });

    const csvContent = buildCsv(headers, rows);

    // Audit log entry
    await logAuditEvent(
      admin.id,
      "export_leads_csv",
      "visitors",
      null,
      { row_count: rows.length },
      req.headers.get("x-forwarded-for")
    );

    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="pathixo-leads-${dateStr}.csv"`,
      },
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      return NextResponse.json({ ok: false, error: "Forbidden: Viewers cannot export data." }, { status: 403 });
    }
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
}
