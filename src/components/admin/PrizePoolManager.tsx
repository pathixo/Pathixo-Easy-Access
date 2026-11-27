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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#252a31] pb-3">
        <div>
          <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
            {"// DYNAMIC PRIZE ENGINE"}
          </span>
          <h2 className="text-base font-black uppercase tracking-tight text-white">
            Prize Pool & Odds Configuration
          </h2>
          <p className="font-mono text-xs text-neutral-400">
            Tune probability weights, stock caps, and winner limits live. Selection is cryptographically atomic.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-xl border border-[#ccff00]/30 bg-[#ccff00]/10 px-3.5 py-1.5 font-mono text-xs font-bold text-[#ccff00]">
            Active Weight: <strong>{totalActiveWeight}</strong>
          </span>
        </div>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-[#ccff00]/30 bg-[#ccff00]/10 p-3 font-mono text-xs text-[#ccff00]">
          <Check className="h-4 w-4 shrink-0 text-[#ccff00]" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300">
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
              className={`rounded-2xl border-2 p-4 flex flex-col justify-between transition ${
                r.is_active
                  ? "border-[#252a31] bg-[#101214] hover:border-[#ccff00]/60 shadow-cyber-sm"
                  : "border-[#1e2227] bg-[#0c0d0e] opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="truncate">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 block truncate">
                      {r.slug}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate" title={r.name}>
                      {r.name}
                    </h3>
                  </div>

                  <button
                    onClick={() => handleToggleActive(r)}
                    className={`rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold uppercase tracking-wider transition shrink-0 ${
                      r.is_active
                        ? "bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/40 hover:bg-[#ccff00]/20"
                        : "bg-neutral-800 text-neutral-400 border border-neutral-700 hover:bg-neutral-700"
                    }`}
                  >
                    {r.is_active ? "Active" : "Paused"}
                  </button>
                </div>

                {isCapped && (
                  <div className="mt-2.5 flex items-center gap-1.5 font-mono text-[10px] font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 rounded-lg px-2 py-1">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>CAP REACHED ({r.claimed_count}/{r.max_cap})</span>
                  </div>
                )}

                {r.max_cap && !isCapped ? (
                  <p className="mt-1.5 font-mono text-[10px] font-bold text-[#ccff00]">
                    Hard-Cap: Max {r.max_cap} winners ({r.claimed_count || 0} won)
                  </p>
                ) : null}

                <p className="mt-2 font-mono text-[11px] text-neutral-400 line-clamp-2 leading-relaxed">
                  {r.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-[#252a31]">
                <div className="flex items-center justify-between font-mono text-[11px]">
                  <div>
                    <span className="text-neutral-500">Weight: </span>
                    <span className="font-bold text-[#ccff00]">{r.probability_weight}</span>
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
                  className="mt-3 flex h-9 w-full items-center justify-center gap-1.5 rounded-xl border border-[#252a31] bg-[#141619] font-mono text-xs font-bold text-white transition hover:border-[#ccff00] hover:text-[#ccff00]"
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  <span>EDIT PRIZE & ODDS</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {editingReward && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
          <div className="w-full max-w-lg rounded-2xl border-2 border-[#252a31] bg-[#101214] p-6 shadow-cyber">
            <div className="flex items-center justify-between border-b border-[#252a31] pb-3">
              <div>
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
                  {"// EDIT PRIZE HUD"}
                </span>
                <h3 className="text-base font-black uppercase tracking-tight text-white">
                  Prize Configuration
                </h3>
                <p className="font-mono text-xs text-neutral-400">Slug: <code className="text-[#ccff00]">{editingReward.slug}</code></p>
              </div>
              <button
                onClick={() => setEditingReward(null)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#252a31] text-neutral-400 hover:border-white hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="mt-4 space-y-3.5 max-h-[75vh] overflow-y-auto pr-1 text-xs font-mono">
              <div>
                <label className="block text-neutral-300 font-bold uppercase">Prize Full Name</label>
                <input
                  type="text"
                  value={editingReward.name}
                  onChange={(e) => setEditingReward({ ...editingReward, name: e.target.value })}
                  className="mt-1 h-10 w-full rounded-xl border border-[#252a31] bg-[#0c0d0e] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase">Display Label (Wheel Segment)</label>
                <input
                  type="text"
                  value={editingReward.display_label || ""}
                  onChange={(e) => setEditingReward({ ...editingReward, display_label: e.target.value })}
                  placeholder="e.g. 1-Yr Vakxo Pro"
                  className="mt-1 h-10 w-full rounded-xl border border-[#252a31] bg-[#0c0d0e] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold uppercase">
                    Probability Weight
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
                    className="mt-1 h-10 w-full rounded-xl border border-[#252a31] bg-[#0c0d0e] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold uppercase">
                    Hard-Cap (Max Winners)
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
                    className="mt-1 h-10 w-full rounded-xl border border-[#252a31] bg-[#0c0d0e] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-neutral-300 font-bold uppercase">Remaining Inventory</label>
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
                    className="mt-1 h-10 w-full rounded-xl border border-[#252a31] bg-[#0c0d0e] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-neutral-300 font-bold uppercase">Total Inventory</label>
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
                    className="mt-1 h-10 w-full rounded-xl border border-[#252a31] bg-[#0c0d0e] px-3 text-white focus:border-[#ccff00] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase">Prize Description</label>
                <textarea
                  rows={2}
                  value={editingReward.description}
                  onChange={(e) => setEditingReward({ ...editingReward, description: e.target.value })}
                  className="mt-1 w-full rounded-xl border border-[#252a31] bg-[#0c0d0e] p-2.5 text-white focus:border-[#ccff00] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-neutral-300 font-bold uppercase">Redemption Instructions</label>
                <textarea
                  rows={2}
                  value={editingReward.redemption_instructions}
                  onChange={(e) =>
                    setEditingReward({ ...editingReward, redemption_instructions: e.target.value })
                  }
                  className="mt-1 w-full rounded-xl border border-[#252a31] bg-[#0c0d0e] p-2.5 text-white focus:border-[#ccff00] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={editingReward.is_active}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, is_active: e.target.checked })
                    }
                    className="h-4 w-4 rounded border-[#252a31] bg-[#0c0d0e] accent-[#ccff00]"
                  />
                  <span className="text-neutral-300 font-bold">Prize is Active in Live Wheel Pool</span>
                </label>
              </div>

              <div className="mt-5 flex justify-end gap-3 border-t border-[#252a31] pt-4">
                <button
                  type="button"
                  onClick={() => setEditingReward(null)}
                  className="h-10 rounded-xl border border-[#252a31] bg-[#141619] px-4 font-mono text-xs font-bold text-neutral-300 hover:border-white hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex h-10 items-center justify-center gap-2 rounded-xl border border-black bg-[#ccff00] text-black px-6 font-mono text-xs font-black uppercase shadow-cyber-sm hover:bg-[#d9ff33] active:translate-y-0.5 active:shadow-none transition disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin text-black" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes ➔</span>
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
