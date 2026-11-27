import { getAdminClient } from "@/lib/supabase/admin";
import { formatKolkataTime } from "@/lib/admin/utils";
import { StallRedemptionTool } from "@/components/admin/StallRedemptionTool";
import { Gift, ShieldCheck } from "lucide-react";

interface RewardItem {
  id: string;
  name: string;
  total_inventory: number;
  remaining_inventory: number;
  is_active: boolean;
}

interface SpinRecord {
  id: string;
  reward_code: string;
  redemption_status: string;
  redeemed_at: string | null;
  created_at: string;
  visitors: { full_name?: string; mobile?: string } | { full_name?: string; mobile?: string }[] | null;
  rewards: { name?: string; reward_type?: string } | { name?: string; reward_type?: string }[] | null;
}

export const dynamic = "force-dynamic";

export default async function AdminLuckyDrawPage() {
  const supabase = getAdminClient();

  const [rewardsRes, spinsRes] = await Promise.all([
    supabase.from("rewards").select("id, name, total_inventory, remaining_inventory, is_active").order("created_at", { ascending: true }),
    supabase
      .from("spins")
      .select(`
        id,
        reward_code,
        redemption_status,
        redeemed_at,
        created_at,
        visitors (full_name, mobile),
        rewards (name, reward_type)
      `)
      .order("created_at", { ascending: false })
      .limit(30),
  ]);

  const rewards = (rewardsRes.data || []) as RewardItem[];
  const recentSpins = (spinsRes.data || []) as SpinRecord[];

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Lucky Draw & Stall Redemption</h1>
        <p className="text-xs text-neutral-400">
          Verify visitor vouchers at the booth, mark prizes as redeemed, and monitor stock inventory.
        </p>
      </div>

      {/* Stall Code Lookup & Redemption Card */}
      <StallRedemptionTool />

      {/* Prize Inventory Overview */}
      <div className="rounded-2xl border border-white/10 bg-[#121218] p-6">
        <h2 className="text-base font-bold text-white">Prize Pool & Remaining Inventory</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rewards &&
            rewards.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/5 bg-white/5 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white">{r.name}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      r.is_active
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                    }`}
                  >
                    {r.is_active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-extrabold text-white">{r.remaining_inventory}</span>
                  <span className="text-xs text-neutral-400">of {r.total_inventory} remaining</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Recent Lucky Draw Allocations */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#121218]">
        <div className="border-b border-white/10 px-6 py-4">
          <h2 className="text-sm font-bold text-white">Recent Lucky Draw Allocations</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Prize Awarded</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Spin Time (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {recentSpins && recentSpins.length > 0 ? (
                recentSpins.map((s) => {
                  const visitor = Array.isArray(s.visitors) ? s.visitors[0] : s.visitors;
                  const reward = Array.isArray(s.rewards) ? s.rewards[0] : s.rewards;
                  const isRedeemed = s.redemption_status === "redeemed";

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono font-bold text-white">{s.reward_code}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{visitor?.full_name}</p>
                        <p className="text-[11px] text-neutral-500">{visitor?.mobile}</p>
                      </td>
                      <td className="px-4 py-3 text-brand-300 font-medium">{reward?.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isRedeemed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {isRedeemed ? "Redeemed" : "Unclaimed"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-neutral-400 text-[11px]">
                        {formatKolkataTime(s.created_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-neutral-500">
                    No lucky draw spins recorded yet.
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
