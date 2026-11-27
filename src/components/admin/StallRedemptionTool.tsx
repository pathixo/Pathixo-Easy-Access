"use client";

import { useState } from "react";
import { Search, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

interface RedemptionResult {
  redeemed: boolean;
  redeemed_at: string;
  visitor?: {
    full_name: string;
    email: string;
    mobile: string;
    company?: string | null;
  } | null;
  reward?: {
    name: string;
    slug: string;
    reward_type: string;
    redemption_instructions: string;
  } | null;
}

export function StallRedemptionTool() {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RedemptionResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code) return;

    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);

    try {
      const res = await fetch("/api/admin/lucky-draw/redeem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reward_code: code }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data?.error?.message || "Voucher verification failed.");
        return;
      }

      setResult(data.data);
      setCode("");
    } catch {
      setErrorMessage("Network error while redeeming voucher.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border-2 border-[#252a31] bg-[#101214] p-6 shadow-cyber transition hover:border-[#ccff00]/40">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
          {"// STALL VOUCHER REDEMPTION ENGINE"}
        </span>
        <span className="rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 px-2.5 py-0.5 font-mono text-[10px] font-bold text-[#ccff00]">
          BOOTH DESK
        </span>
      </div>

      <h2 className="mt-1.5 text-lg font-black uppercase tracking-tight text-white">
        Voucher Quick-Verify & Claim
      </h2>
      <p className="mt-1 font-mono text-xs text-neutral-400">
        Enter the visitor&apos;s voucher code (e.g. <code className="text-[#ccff00] font-bold">PX-XXXX-XXXX</code>) to verify authenticity and mark as redeemed at stall.
      </p>

      <form onSubmit={handleRedeem} className="mt-4 flex flex-col sm:flex-row gap-3 max-w-lg">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="PX-XXXX-XXXX"
          className="h-12 flex-1 rounded-xl border border-[#252a31] bg-[#0c0d0e] px-4 font-mono text-sm font-bold tracking-wider text-white placeholder-neutral-600 uppercase focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
        />
        <button
          type="submit"
          disabled={isLoading || !code}
          className="flex h-12 items-center justify-center gap-2 rounded-xl border border-black bg-[#ccff00] px-6 font-mono text-xs font-black uppercase text-black shadow-cyber-sm hover:bg-[#d9ff33] active:translate-y-0.5 active:shadow-none transition disabled:opacity-50 disabled:pointer-events-none"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-black" />
          ) : (
            <span>VERIFY & REDEEM ➔</span>
          )}
        </button>
      </form>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#ccff00]/40 bg-[#ccff00]/10 p-4 font-mono text-xs text-neutral-200">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-[#ccff00] mt-0.5" />
          <div className="space-y-1">
            <p className="font-black text-white text-sm uppercase">VOUCHER MARKED REDEEMED</p>
            <p>
              <strong className="text-white">ATTENDEE:</strong> {result.visitor?.full_name} ({result.visitor?.mobile})
            </p>
            <p>
              <strong className="text-[#ccff00]">PRIZE:</strong> {result.reward?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
