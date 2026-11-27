import Link from "next/link";
import { Sparkles } from "lucide-react";
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#252a31] pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
              {"// BOOTH CONTROLLER HUD"}
            </span>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ccff00] animate-pulse" />
          </div>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            Lucky Draw & <span className="text-[#ccff00]">Reward Engine</span>
          </h1>
          <p className="mt-1 font-mono text-xs text-neutral-400">
            Verify visitor vouchers at the booth, mark prizes redeemed, tune probabilities & hard-caps live.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/test-spin"
            target="_blank"
            className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#ccff00]/40 bg-[#ccff00]/10 px-3.5 font-mono text-xs font-bold text-[#ccff00] hover:bg-[#ccff00] hover:text-black transition"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Launch Testing Lab</span>
          </Link>
          <div className="rounded-xl border border-[#252a31] bg-[#101214] px-4 py-2 text-right">
            <span className="block font-mono text-[10px] uppercase text-neutral-400">System Mode</span>
            <span className="font-mono text-xs font-bold text-[#ccff00]">LIVE EXPO ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Stall Code Lookup & Redemption Card */}
      <StallRedemptionTool />

      {/* Live Editable Prize Pool & Odds Configuration */}
      <PrizePoolManager initialRewards={rewards} />

      {/* Recent Lucky Draw Allocations */}
      <div className="overflow-hidden rounded-2xl border-2 border-[#252a31] bg-[#101214] shadow-cyber">
        <div className="border-b border-[#252a31] bg-[#141619] px-6 py-4 flex items-center justify-between">
          <div>
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
              {"// LIVE ALLOCATIONS LOG"}
            </span>
            <h2 className="text-sm font-black uppercase tracking-wide text-white">
              Recent Lucky Draw Allocations & Fulfillment
            </h2>
          </div>
          <span className="font-mono text-[11px] text-neutral-400">
            Total Shown: <strong className="text-white">{recentSpins.length}</strong>
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#252a31] bg-[#0c0d0e] font-mono text-neutral-400 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Code</th>
                <th className="px-4 py-3">Attendee</th>
                <th className="px-4 py-3">Prize Awarded</th>
                <th className="px-4 py-3">Fulfillment</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Time (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#252a31] text-neutral-300">
              {recentSpins && recentSpins.length > 0 ? (
                recentSpins.map((s) => {
                  const visitor = Array.isArray(s.visitors) ? s.visitors[0] : s.visitors;
                  const reward = Array.isArray(s.rewards) ? s.rewards[0] : s.rewards;
                  const isRedeemed = s.fulfillment_status === "redeemed_at_booth" || s.redemption_status === "redeemed";
                  const emailSent = s.email_status === "sent";

                  return (
                    <tr key={s.id} className="hover:bg-white/[0.02] transition">
                      <td className="px-4 py-3 font-mono font-bold text-[#ccff00]">{s.reward_code}</td>
                      <td className="px-4 py-3">
                        <p className="font-bold text-white">{visitor?.full_name}</p>
                        <p className="text-[11px] font-mono text-neutral-400">{visitor?.mobile}</p>
                      </td>
                      <td className="px-4 py-3 text-neutral-200 font-semibold">{reward?.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            isRedeemed
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                          }`}
                        >
                          {isRedeemed ? "Redeemed at Booth" : "Unclaimed"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase ${
                            emailSent
                              ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                              : s.email_status === "failed"
                              ? "bg-red-500/10 text-red-400 border border-red-500/30"
                              : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/30"
                          }`}
                        >
                          {s.email_status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-neutral-400 text-[11px]">
                        {formatKolkataTime(s.created_at)}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center font-mono text-neutral-500">
                    {"// NO LUCKY DRAW ALLOCATIONS RECORDED YET"}
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
