"use client";

import { useState } from "react";
import { Edit3, Check, X, Loader2, AlertCircle, ShieldAlert } from "lucide-react";

export interface RewardItem {
  id: string;
  name: string;
  display_label?: string | null;
  slug: string;
  description: string;
  reward_type: string;
  total_inventory: number;
  remaining_inventory: number;
  max_cap?: number | null;
  claimed_count?: number;
  probability_weight: number;
  is_active: boolean;
  expiry_days: number;
  redemption_instructions: string;
}

interface PrizePoolManagerProps {
  initialRewards: RewardItem[];
}

export function PrizePoolManager({ initialRewards }: PrizePoolManagerProps) {
  const [rewards, setRewards] = useState<RewardItem[]>(initialRewards);
  const [editingReward, setEditingReward] = useState<RewardItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const totalActiveWeight = rewards
    .filter((r) => r.is_active && (r.max_cap == null || (r.claimed_count || 0) < r.max_cap))
    .reduce((sum, r) => sum + (r.probability_weight || 0), 0);

  const handleToggleActive = async (reward: RewardItem) => {
    const updatedStatus = !reward.is_active;

    setRewards((prev) =>
      prev.map((r) => (r.id === reward.id ? { ...r, is_active: updatedStatus } : r))
    );

    try {
      const res = await fetch(`/api/admin/rewards/${reward.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: updatedStatus }),
      });

      if (!res.ok) {
        setRewards((prev) =>
          prev.map((r) => (r.id === reward.id ? { ...r, is_active: !updatedStatus } : r))
        );
        setErrorMsg("Failed to update active state. Please retry.");
      }
    } catch {
      setRewards((prev) =>
        prev.map((r) => (r.id === reward.id ? { ...r, is_active: !updatedStatus } : r))
      );
      setErrorMsg("Network error updating prize state.");
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingReward) return;

    setIsSaving(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const payload = {
        name: editingReward.name,
        display_label: editingReward.display_label,
        description: editingReward.description,
        probability_weight: editingReward.probability_weight,
        max_cap: editingReward.max_cap === 0 || !editingReward.max_cap ? null : editingReward.max_cap,
        total_inventory: editingReward.total_inventory,
        remaining_inventory: editingReward.remaining_inventory,
        redemption_instructions: editingReward.redemption_instructions,
        is_active: editingReward.is_active,
        expiry_days: editingReward.expiry_days,
      };

      const res = await fetch(`/api/admin/rewards/${editingReward.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMsg(data?.error?.message || "Failed to update reward.");
        return;
      }

      const updated = data.data as RewardItem;
      setRewards((prev) => prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r)));
      setSuccessMsg(`Successfully updated "${updated.name}"!`);
      setEditingReward(null);
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch {
      setErrorMsg("Network connection error. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-white">Prize Pool & Odds Configuration</h2>
          <p className="text-xs text-neutral-400">
            Edit probabilities, stock limits, and winner caps live during the exhibition.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-xs text-[#ccff00]">
            Active Probability Weight: <strong>{totalActiveWeight}</strong>
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
          <Check className="h-4 w-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {rewards.map((r) => {
          const oddsPct =
            r.is_active && totalActiveWeight > 0
              ? ((r.probability_weight / totalActiveWeight) * 100).toFixed(1)
              : "0";
          const isCapped = r.max_cap != null && (r.claimed_count || 0) >= r.max_cap;

          return (
            <div
              key={r.id}
              className={`rounded-xl border p-4 flex flex-col justify-between transition ${
                r.is_active
                  ? "border-white/[0.08] bg-[#121218] hover:border-[#ccff00]/40"
                  : "border-white/[0.04] bg-[#0c0c10] opacity-65"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 block">
                      {r.slug}
                    </span>
                    <h3 className="text-xs font-bold text-white truncate" title={r.name}>
                      {r.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleActive(r)}
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold transition shrink-0 ${
                      r.is_active
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                        : "bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 hover:bg-neutral-500/20"
                    }`}
                  >
                    {r.is_active ? "Active" : "Paused"}
                  </button>
                </div>

                {isCapped && (
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded px-1.5 py-0.5">
                    <ShieldAlert className="h-3 w-3" />
                    <span>Hard-Cap Reached ({r.claimed_count}/{r.max_cap})</span>
                  </div>
                )}

                {r.max_cap && !isCapped ? (
                  <p className="mt-1 text-[10px] text-[#ccff00] font-mono">
                    Hard-Cap: Max {r.max_cap} winners ({r.claimed_count || 0} won)
                  </p>
                ) : null}

                <p className="mt-2 text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-white/[0.04]">
                <div className="flex items-center justify-between text-[11px]">
                  <div>
                    <span className="text-neutral-500">Weight: </span>
                    <span className="font-bold text-white">{r.probability_weight}</span>
                    <span className="text-neutral-400"> ({oddsPct}%)</span>
                  </div>
                  <div>
                    <span className="text-neutral-500">Stock: </span>
                    <span className="font-bold text-white">
                      {r.total_inventory > 0 ? r.remaining_inventory : "∞"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setEditingReward(r)}
                  className="mt-3 flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] text-[11px] font-medium text-neutral-200 transition hover:border-[#ccff00]/50 hover:text-[#ccff00]"
                >
                  <Edit3 className="h-3 w-3" />
                  <span>Edit Prize & Odds</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#121218] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <h3 className="text-base font-bold text-white">Edit Prize Configuration</h3>
                <p className="text-xs text-neutral-400">Slug: <code>{editingReward.slug}</code></p>
              </div>
              <button
                onClick={() => setEditingReward(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 max-h-[75vh] overflow-y-auto pr-1 text-xs">
              <div>
                <label className="block text-neutral-300 font-medium">Prize Full Name</label>
                <input
                  type="text"
                  value={editingReward.name}
                  onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium">Display Label (Wheel Segment Text)</label>
                <input
                  type="text"
                  value={editingReward.display_label || ""}
                  onChange={(e) => setEditingReward({ ...editingReward, display_label: e.target.value })}
                  placeholder="e.g. 1-Yr Vakxo Pro"
                  className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium">
                    Probability Weight (Odds)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingReward.probability_weight}
                    onChange={(e) =>
                      setEditingReward({
                        ...editingReward,
                        probability_weight: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium">
                    Strict Hard-Cap (Max Winners)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingReward.max_cap ?? ""}
                    onChange={(e) =>
                      setEditingReward({
                        ...editingReward,
                        max_cap: e.target.value === "" ? null : parseInt(e.target.value) || null,
                      })
                    }
                    placeholder="Empty = unlimited"
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-medium">Remaining Inventory</label>
                  <input
                    type="number"
                    min="0"
                    value={editingReward.remaining_inventory}
                    onChange={(e) =>
                      setEditingReward({
                        ...editingReward,
                        remaining_inventory: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-medium">Total Inventory</label>
                  <input
                    type="number"
                    min="0"
                    value={editingReward.total_inventory}
                    onChange={(e) =>
                      setEditingReward({
                        ...editingReward,
                        total_inventory: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="mt-1 h-9 w-full rounded-lg border border-white/10 bg-white/[0.04] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-medium">Prize Description</label>
                <textarea
                  rows={2}
                  value={editingReward.description}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-[#ccff00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-medium">Redemption Instructions</label>
                <textarea
                  rows={2}
                  value={editingReward.redemption_instructions}
                  onChange={(e) =>
                    setEditingReward({ ...editingReward, redemption_instructions: e.target.value })
                  }
                  className="mt-1 w-full rounded-lg border border-white/10 bg-white/[0.04] p-2.5 text-white focus:border-[#ccff00] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingReward.is_active}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-white/20 bg-white/10 accent-[#ccff00]"
                  />
                  <span className="text-neutral-300">Prize is Active in Live Wheel Pool</span>
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-2.5 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  className="h-9 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-xs font-medium text-neutral-300 hover:bg-white/[0.08]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-xl bg-[#ccff00] text-black px-5 text-xs font-bold hover:bg-[#d9ff33] active:scale-95 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
