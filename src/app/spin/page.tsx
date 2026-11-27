import type { Metadata } from "next";
import Link from "next/link";
import { SpinWheel } from "@/components/public/SpinWheel";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Spin & Win Lucky Draw — Pathixo Trade Show",
  description: "Participate in Pathixo's exclusive trade show lucky draw and win Vakxo Pro subscriptions, tech swag, and engineering vouchers.",
};

export default function SpinPage() {
  return (
    <main className="min-h-screen bg-[#0a0b0c] text-[#f4f4f5] selection:bg-[#ccff00] selection:text-black">
      {/* Top Cyber HUD Navigation matching CyberPortal */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0b0c]/90 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-[#141619] px-3 font-mono text-xs font-bold uppercase text-neutral-300 transition hover:border-[#ccff00] hover:text-[#ccff00]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back</span>
          </Link>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-3 py-1">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#ccff00]" />
            <span className="font-mono text-[10px] font-bold tracking-wider text-[#ccff00] uppercase">
              MEERUT TRADE SHOW 2026
            </span>
          </div>
        </div>
      </header>

      <div className="py-6 sm:py-10">
        <SpinWheel />
      </div>
    </main>
  );
}
