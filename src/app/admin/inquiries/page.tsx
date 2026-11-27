import { getAdminClient } from "@/lib/supabase/admin";
import { formatKolkataTime } from "@/lib/admin/utils";
import { Download } from "lucide-react";
import { InquiryStatusSelector } from "@/components/admin/InquiryStatusSelector";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  const supabase = getAdminClient();

  const { data: inquiries } = await supabase
    .from("business_inquiries")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Business Inquiries & RFPs</h1>
          <p className="text-xs text-neutral-400">
            Triage, update lead pipeline status, and review consultation project descriptions.
          </p>
        </div>

        <a
          href="/api/admin/export/inquiries"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Export Inquiries CSV</span>
        </a>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121218]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Contact</th>
                <th className="px-4 py-3.5">Service & Budget</th>
                <th className="px-4 py-3.5">Project Scope</th>
                <th className="px-4 py-3.5">Pipeline Status</th>
                <th className="px-4 py-3.5">Submitted (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {inquiries && inquiries.length > 0 ? (
                inquiries.map((iq) => (
                  <tr key={iq.id} className="hover:bg-white/[0.02]">
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-white">{iq.full_name}</p>
                      <p className="text-[11px] text-neutral-400">{iq.email}</p>
                      <p className="text-[11px] text-neutral-500">{iq.mobile}</p>
                      {iq.company && <p className="text-[11px] text-brand-300 font-medium">{iq.company}</p>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-neutral-300">
                        {iq.service_needed || "General Engineering"}
                      </span>
                      <p className="mt-1 text-[11px] text-neutral-400">{iq.estimated_budget || "Not Specified"}</p>
                    </td>
                    <td className="px-4 py-3.5 max-w-xs">
                      <p className="line-clamp-3 text-neutral-300 leading-relaxed text-xs">
                        {iq.project_description}
                      </p>
                    </td>
                    <td className="px-4 py-3.5">
                      <InquiryStatusSelector inquiryId={iq.id} currentStatus={iq.lead_status} />
                    </td>
                    <td className="px-4 py-3.5 text-neutral-400 text-[11px]">
                      {formatKolkataTime(iq.created_at)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-neutral-500">
                    No business inquiries submitted yet.
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
