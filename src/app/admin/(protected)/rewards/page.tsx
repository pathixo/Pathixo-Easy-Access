import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
import { PrizePoolManager, RewardItem } from "@/components/admin/PrizePoolManager";

export const dynamic = "force-dynamic";

export default async function AdminRewardsPage() {
  let rewards: RewardItem[] = [];
  let loadError: string | null = null;

  if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
    rewards = getDevStore().rewards;
  } else {
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("rewards")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      loadError = error.message;
    } else {
      rewards = (data || []) as RewardItem[];
    }
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="border-b border-[#252a31] pb-5">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
          {"// REWARD CONTROL"}
        </span>
        <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
          Rewards & <span className="text-[#ccff00]">Wheel Configuration</span>
        </h1>
        <p className="mt-1 font-mono text-xs text-neutral-400">
          Activate only approved prizes. Every active reward becomes a segment on the public wheel.
        </p>
      </div>

      {loadError && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300">
          Could not load rewards: {loadError}
        </div>
      )}

      <PrizePoolManager initialRewards={rewards} />
    </div>
  );
}
