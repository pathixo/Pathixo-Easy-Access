import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
import { requireAdmin } from "@/lib/admin/auth";
import { formatKolkataTime } from "@/lib/admin/utils";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  try {
    await requireAdmin(["super_admin", "admin"]);
  } catch {
    redirect("/admin");
  }

  type AuditRow = {
    id: string;
    action: string;
    entity_type: string;
    entity_id: string | null;
    details: Record<string, unknown>;
    ip_address: string | null;
    created_at: string;
  };

  let logs: AuditRow[] = [];
  if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
    logs = getDevStore().auditLogs.slice(0, 50);
  } else {
    const supabase = getAdminClient();
    const { data } = await supabase
      .from("audit_logs")
      .select(`
        id,
        action,
        entity_type,
        entity_id,
        details,
        ip_address,
        created_at
      `)
      .order("created_at", { ascending: false })
      .limit(50);
    logs = (data || []) as AuditRow[];
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">System Audit Trail</h1>
        <p className="text-xs text-neutral-400">
          Accountability log recording staff authentication, status updates, voucher redemptions, and data exports.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121218]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Timestamp (IST)</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Entity</th>
                <th className="px-4 py-3">IP Address</th>
                <th className="px-4 py-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {logs && logs.length > 0 ? (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-neutral-400 font-mono text-[11px]">
                      {formatKolkataTime(log.created_at)}
                    </td>
                    <td className="px-4 py-3 font-semibold text-white">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-neutral-400">{log.entity_type}</td>
                    <td className="px-4 py-3 text-neutral-500 font-mono text-[11px]">
                      {log.ip_address || "—"}
                    </td>
                    <td className="px-4 py-3 max-w-md font-mono text-[10px] text-neutral-400 truncate">
                      {JSON.stringify(log.details)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                    No audit log records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
