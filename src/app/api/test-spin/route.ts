import { NextRequest } from "next/server";
import crypto from "crypto";
import { getAdminClient, isSupabaseConfigured } from "@/lib/supabase/admin";
import { getDevStore } from "@/lib/dev-store";
import { apiError, apiSuccess } from "@/lib/security/errors";

export const dynamic = "force-dynamic";

interface SimulatorReward {
  id: string;
  slug: string;
  name: string;
  display_label: string | null;
  reward_type: string;
  probability_weight: number;
  total_inventory: number;
  remaining_inventory: number;
  max_cap: number | null;
  claimed_count: number;
  description: string;
  expiry_days: number;
  redemption_instructions: string;
}

async function getActivePool(): Promise<SimulatorReward[]> {
  if (!isSupabaseConfigured() && process.env.NODE_ENV !== "production") {
    const store = getDevStore();
    return store.rewards.map((r) => ({
      id: r.id,
      slug: r.slug,
      name: r.name,
      display_label: r.display_label,
      reward_type: r.reward_type,
      probability_weight: r.probability_weight,
      total_inventory: r.total_inventory,
      remaining_inventory: r.remaining_inventory,
      max_cap: r.max_cap,
      claimed_count: r.claimed_count,
      description: r.description,
      expiry_days: r.expiry_days,
      redemption_instructions: r.redemption_instructions,
    }));
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("rewards")
    .select("*")
    .eq("is_active", true)
    .order("id", { ascending: true });

  if (error || !data) {
    throw new Error(error?.message || "Failed to load rewards pool");
  }

  return data as SimulatorReward[];
}

function pickWinner(pool: SimulatorReward[]): SimulatorReward {
  const eligible = pool.filter((r) => r.probability_weight > 0);
  const totalWeight = eligible.reduce((sum, r) => sum + r.probability_weight, 0);

  if (totalWeight <= 0) {
    return eligible[0] || pool[0];
  }

  const point = crypto.randomInt(1, totalWeight + 1);
  let running = 0;
  for (const r of eligible) {
    running += r.probability_weight;
    if (running >= point) {
      return r;
    }
  }

  return eligible[eligible.length - 1];
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({ mode: "single" }));
    const mode = body.mode || "single";
    const pool = await getActivePool();

    if (mode === "batch") {
      const count = Math.min(Math.max(Number(body.count) || 100, 10), 10000);
      const counts: Record<string, number> = {};
      
      pool.forEach((r) => {
        counts[r.slug] = 0;
      });

      for (let i = 0; i < count; i++) {
        const winner = pickWinner(pool);
        counts[winner.slug] = (counts[winner.slug] || 0) + 1;
      }

      const totalWeight = pool.reduce((sum, r) => sum + r.probability_weight, 0);

      const stats = pool.map((r) => {
        const hits = counts[r.slug] || 0;
        const actualPercentage = Number(((hits / count) * 100).toFixed(2));
        const expectedPercentage = totalWeight > 0 ? Number(((r.probability_weight / totalWeight) * 100).toFixed(2)) : 0;
        return {
          slug: r.slug,
          name: r.name,
          display_label: r.display_label || r.name,
          reward_type: r.reward_type,
          probability_weight: r.probability_weight,
          expected_percentage: expectedPercentage,
          actual_percentage: actualPercentage,
          hits,
        };
      });

      return apiSuccess({
        mode: "batch",
        total_simulations: count,
        stats,
      });
    }

    // Single test spin
    const winner = pickWinner(pool);
    const code = "PX-TEST-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const expiresAt = new Date(Date.now() + (winner.expiry_days || 30) * 86400000).toISOString();
    const targetIndex = pool.findIndex((r) => r.slug === winner.slug);

    return apiSuccess({
      mode: "single",
      spin_id: "test_" + crypto.randomUUID(),
      reward_id: winner.id,
      reward_name: winner.name,
      display_label: winner.display_label || winner.name,
      reward_slug: winner.slug,
      reward_type: winner.reward_type,
      reward_description: winner.description,
      reward_code: code,
      expires_at: expiresAt,
      redemption_instructions: winner.redemption_instructions,
      target_index: targetIndex >= 0 ? targetIndex : 0,
      pool_size: pool.length,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal simulator error";
    return apiError("SIMULATOR_ERROR", message, 500);
  }
}
