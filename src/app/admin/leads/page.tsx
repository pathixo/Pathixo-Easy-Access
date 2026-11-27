import { getAdminClient } from "@/lib/supabase/admin";
import { formatKolkataTime } from "@/lib/admin/utils";
import { Download, Search, Filter } from "lucide-react";

export const dynamic = "force-dynamic";

interface LeadsPageProps {
  searchParams?: {
    q?: string;
    product?: string;
  };
}

export default async function AdminLeadsPage({ searchParams }: LeadsPageProps) {
  const supabase = getAdminClient();
  const q = searchParams?.q?.toLowerCase() || "";
  const product = searchParams?.product || "";

  let query = supabase
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
        rewards (name)
      )
    `)
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) {
    query = query.or(`full_name.ilike.%${q}%,email.ilike.%${q}%,mobile.ilike.%${q}%`);
  }
  if (product && product !== "all") {
    query = query.eq("interested_product", product);
  }

  const { data: leads, error } = await query;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header & Export Action */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Leads & Visitors</h1>
          <p className="text-xs text-neutral-400">
            Search, inspect, and export verified booth attendees and Lucky Draw participants.
          </p>
        </div>

        <a
          href="/api/admin/export/leads"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white/10 px-4 text-xs font-semibold text-white transition hover:bg-white/20 active:scale-95"
        >
          <Download className="h-4 w-4" />
          <span>Export Leads CSV</span>
        </a>
      </div>

      {/* Filter / Search Bar */}
      <div className="rounded-2xl border border-white/10 bg-[#121218] p-4">
        <form method="GET" className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-neutral-500" />
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Search by name, email, or mobile..."
              className="h-10 w-full rounded-xl border border-white/10 bg-white/5 pl-10 pr-3 text-xs text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <select
            name="product"
            defaultValue={product}
            className="h-10 rounded-xl border border-white/10 bg-[#161622] px-3 text-xs text-white focus:border-brand-500 focus:outline-none"
          >
            <option value="all">All Products</option>
            <option value="vakxo">Vakxo</option>
            <option value="kroc-pdf">krocPDF</option>
            <option value="custom-engineering">Custom Engineering</option>
          </select>

          <button
            type="submit"
            className="h-10 rounded-xl bg-brand-600 px-5 text-xs font-semibold text-white transition hover:bg-brand-500"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Leads Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121218]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Visitor</th>
                <th className="px-4 py-3.5">Company & Role</th>
                <th className="px-4 py-3.5">Interest</th>
                <th className="px-4 py-3.5">Voucher Code</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Registered (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {leads && leads.length > 0 ? (
                leads.map((lead) => {
                  const spin = Array.isArray(lead.spins) ? lead.spins[0] : lead.spins;
                  const isRedeemed = spin?.redemption_status === "redeemed";

                  return (
                    <tr key={lead.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-white">{lead.full_name}</p>
                        <p className="text-[11px] text-neutral-400">{lead.email}</p>
                        <p className="text-[11px] text-neutral-500">{lead.mobile}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-white">{lead.company || "—"}</p>
                        <p className="text-[11px] text-neutral-500">{lead.designation || "—"}</p>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-brand-300">
                          {lead.interested_product || "General"}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-mono">
                        {spin?.reward_code ? (
                          <span className="font-bold text-white">{spin.reward_code}</span>
                        ) : (
                          <span className="text-neutral-500">Not Spun</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5">
                        {spin ? (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${
                              isRedeemed
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {isRedeemed ? "Redeemed" : "Unclaimed"}
                          </span>
                        ) : (
                          <span className="text-neutral-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-neutral-400 text-[11px]">
                        {formatKolkataTime(lead.created_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-neutral-500">
                    No matching leads found.
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
