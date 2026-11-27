import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
import { formatKolkataTime } from "@/lib/admin/utils";
import { StallRedemptionTool } from "@/components/admin/StallRedemptionTool";
import { PrizePoolManager, RewardItem } from "@/components/admin/PrizePoolManager";

interface SpinRecord {
  id: string;
  reward_code: string;
  redemption_status: string;
  fulfillment_status?: string;
  email_status?: string;
  redeemed_at: string | null;
  created_at: string;
  visitors: { full_name?: string; mobile?: string } | { full_name?: string; mobile?: string }[] | null;
  rewards: { name?: string; reward_type?: string } | { name?: string; reward_type?: string }[] | null;
}

export const dynamic = "force-dynamic";

export default async function AdminLuckyDrawPage() {
  let rewards: RewardItem[] = [];
  let recentSpins: SpinRecord[] = [];

  if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
    const store = getDevStore();
    rewards = store.rewards;
    recentSpins = store.spins.slice(0, 30).map((s) => {
      const rew = store.rewards.find((r) => r.id === s.reward_id);
      return {
        id: s.id,
        reward_code: s.reward_code,
        redemption_status: s.redemption_status,
        fulfillment_status: s.fulfillment_status,
        email_status: s.email_status,
        redeemed_at: s.redeemed_at,
        created_at: s.created_at,
        visitors: { full_name: s.user_name, mobile: s.user_phone },
        rewards: { name: rew?.name || s.prize_label, reward_type: rew?.reward_type || "discount" },
      };
    });
  } else {
    const supabase = getAdminClient();

    const [rewardsRes, spinsRes] = await Promise.all([
      supabase
        .from("rewards")
        .select("*")
        .order("created_at", { ascending: true }),
      supabase
        .from("spins")
        .select(`
          id,
          reward_code,
          redemption_status,
          fulfillment_status,
          email_status,
          redeemed_at,
          created_at,
          visitors (full_name, mobile),
          rewards (name, reward_type)
        `)
        .order("created_at", { ascending: false })
        .limit(30),
    ]);

    rewards = (rewardsRes.data || []) as RewardItem[];
    recentSpins = (spinsRes.data || []) as SpinRecord[];
  }

  return (
    <div className="space-y-8 max-w-6xl">
      <div>
        <h1 className="text-2xl font-extrabold text-white">Lucky Draw & Stall Redemption</h1>
        <p className="text-xs text-neutral-400">
          Verify visitor vouchers at the booth, mark prizes as redeemed, configure odds, and monitor stock inventory live.
        </p>
      </div>

      {/* Stall Code Lookup & Redemption Card */}
      <StallRedemptionTool />

      {/* Live Editable Prize Pool & Odds Configuration */}
      <PrizePoolManager initialRewards={rewards} />

      {/* Recent Lucky Draw Allocations */}
      <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121218]">
        <div className="border-b border-white/[0.08] px-6 py-4">
          <h2 className="text-sm font-bold text-white">Recent Lucky Draw Allocations & Fulfillment</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/5 text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Prize Awarded</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Time (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-neutral-300">
              {recentSpins && recentSpins.length > 0 ? (
                recentSpins.map((s) => {
                  const visitor = Array.isArray(s.visitors) ? s.visitors[0] : s.visitors;
                  const reward = Array.isArray(s.rewards) ? s.rewards[0] : s.rewards;
                  const isRedeemed = s.fulfillment_status === "redeemed_at_booth" || s.redemption_status === "redeemed";
                  const emailSent = s.email_status === "sent";

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.02]">
                      <td className="px-4 py-3 font-mono font-bold text-[#ccff00]">{s.reward_code}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{visitor?.full_name}</p>
                        <p className="text-[11px] font-mono text-neutral-500">{visitor?.mobile}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-200 font-medium">{reward?.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            isRedeemed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          }`}
                        >
                          {isRedeemed ? "Redeemed at Booth" : "Unclaimed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                            emailSent
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/20"
                              : s.email_status === "failed"
                              ? "bg-red-500/10 text-red-400 border border-red-500/20"
                              : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20"
                          }`}
                        >
                          {s.email_status || "pending"}
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
                  <td colSpan={6} className="px-4 py-6 text-center text-neutral-500">
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
