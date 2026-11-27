import { getAdminClient } from "@/lib/supabase/admin";
import { formatKolkataTime } from "@/lib/admin/utils";
import { Users, MessageSquare, Gift, CheckCircle, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const supabase = getAdminClient();

  // 1. Fetch real counts in parallel
  const [
    { count: visitorCount },
    { count: inquiryCount },
    { count: spinCount },
    { count: redeemedCount },
    { data: recentVisitors },
    { data: productInterestStats },
  ] = await Promise.all([
    supabase.from("visitors").select("*", { count: "exact", head: true }),
    supabase.from("business_inquiries").select("*", { count: "exact", head: true }),
    supabase.from("spins").select("*", { count: "exact", head: true }),
    supabase.from("spins").select("*", { count: "exact", head: true }).eq("redemption_status", "redeemed"),
    supabase.from("visitors").select("id, full_name, email, mobile, interested_product, created_at").order("created_at", { ascending: false }).limit(6),
    supabase.from("visitors").select("interested_product"),
  ]);

  const totalVisitors = visitorCount || 0;
  const totalInquiries = inquiryCount || 0;
  const totalSpins = spinCount || 0;
  const totalRedeemed = redeemedCount || 0;
  const conversionRate = totalVisitors > 0 ? ((totalInquiries / totalVisitors) * 100).toFixed(1) : "0";
  const redemptionRate = totalSpins > 0 ? ((totalRedeemed / totalSpins) * 100).toFixed(1) : "0";

  // Product interest aggregation
  const productTally: Record<string, number> = {};
  productInterestStats?.forEach((item) => {
    const key = item.interested_product || "General";
    productTally[key] = (productTally[key] || 0) + 1;
  });

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Exhibition Performance Dashboard</h1>
        <p className="mt-1 text-xs text-neutral-400">
          Real-time metrics and visitor interactions from India Expo Centre & Mart.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Visitors */}
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Registered Leads</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{totalVisitors}</p>
          <p className="mt-1 text-[11px] text-neutral-500">Verified booth attendees</p>
        </div>

        {/* Inquiries */}
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Project Inquiries</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{totalInquiries}</p>
          <p className="mt-1 text-[11px] text-emerald-400">{conversionRate}% conversion rate</p>
        </div>

        {/* Spins */}
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Lucky Draw Spins</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-400">
              <Gift className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{totalSpins}</p>
          <p className="mt-1 text-[11px] text-neutral-500">Vouchers generated</p>
        </div>

        {/* Redeemed */}
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">Prizes Redeemed</span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
              <CheckCircle className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-3 text-3xl font-extrabold text-white">{totalRedeemed}</p>
          <p className="mt-1 text-[11px] text-amber-400">{redemptionRate}% stall claimed</p>
        </div>
      </div>

      {/* Two Column Section */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Leads */}
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-[#121218] p-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="text-sm font-bold text-white">Latest Registered Leads</h2>
            <Link href="/admin/leads" className="text-xs font-semibold text-brand-400 hover:text-brand-300">
              View All Leads →
            </Link>
          </div>

          <div className="mt-4 divide-y divide-white/5">
            {recentVisitors && recentVisitors.length > 0 ? (
              recentVisitors.map((v) => (
                <div key={v.id} className="flex items-center justify-between py-3 text-xs">
                  <div>
                    <p className="font-semibold text-white">{v.full_name}</p>
                    <p className="text-neutral-400">{v.email} • {v.mobile}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] text-neutral-300">
                      {v.interested_product || "General"}
                    </span>
                    <p className="mt-1 text-[10px] text-neutral-500">{formatKolkataTime(v.created_at)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-xs text-neutral-500">No registrations yet.</p>
            )}
          </div>
        </div>

        {/* Product Interest Breakdown */}
        <div className="rounded-2xl border border-white/10 bg-[#121218] p-6">
          <div className="border-b border-white/10 pb-4">
            <h2 className="text-sm font-bold text-white">Product Interest Breakdown</h2>
            <p className="text-[11px] text-neutral-400">Visitor preference signals</p>
          </div>

          <div className="mt-5 space-y-4">
            {Object.entries(productTally).length > 0 ? (
              Object.entries(productTally).map(([prod, count]) => {
                const percent = totalVisitors > 0 ? Math.round((count / totalVisitors) * 100) : 0;
                return (
                  <div key={prod} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="capitalize font-medium text-neutral-300">{prod.replace("-", " ")}</span>
                      <span className="font-mono text-neutral-400">{count} ({percent}%)</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-brand-500" style={{ width: `${percent}%` }} />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-6 text-center text-xs text-neutral-500">No preference data yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
