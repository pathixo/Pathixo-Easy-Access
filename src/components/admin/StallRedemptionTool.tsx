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
    <div className="rounded-2xl border border-brand-500/30 bg-gradient-to-r from-brand-950/40 to-[#121218] p-6 shadow-xl">
      <h2 className="text-base font-bold text-white">Stall Voucher Quick-Redeem</h2>
      <p className="mt-1 text-xs text-neutral-300">
        Enter the visitor&apos;s 8-character voucher code (e.g. <code>PX-XXXX-XXXX</code>) to verify authenticity and mark as claimed.
      </p>

      <form onSubmit={handleRedeem} className="mt-4 flex gap-3 max-w-md">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="PX-XXXX-XXXX"
          className="h-11 flex-1 rounded-xl border border-white/10 bg-white/5 px-3.5 font-mono text-sm text-white placeholder-neutral-500 uppercase focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isLoading || !code}
          className="flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-600 px-5 text-xs font-semibold text-white transition hover:bg-brand-500 active:scale-95 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <span>Verify & Redeem</span>}
        </button>
      </form>

      {errorMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {result && (
        <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
          <div>
            <p className="font-bold text-white text-sm">Voucher Successfully Marked Redeemed!</p>
            <p className="mt-1">
              <strong>Attendee:</strong> {result.visitor?.full_name} ({result.visitor?.mobile})
            </p>
            <p>
              <strong>Prize:</strong> {result.reward?.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
