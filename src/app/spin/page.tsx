import type { Metadata } from "next";
import Link from "next/link";
import { SpinWheel } from "@/components/public/SpinWheel";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Spin & Win Lucky Draw — Pathixo Expo 2026",
  description: "Participate in Pathixo's exclusive expo lucky draw and win Vakxo Pro subscriptions, tech swag, and engineering vouchers.",
};

export default function SpinPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0b0c] text-[#f4f4f5] flex flex-col justify-between selection:bg-[#ccff00] selection:text-black">
      {/* Background Cyber Grid / Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#1c222b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="pointer-events-none fixed -top-28 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#ccff00]/5 blur-[140px]" />

      {/* Top Cyber HUD Navigation matching CyberPortal */}
      <header className="relative z-10 border-b border-white/10 bg-[#0e1013]/90 backdrop-blur-md px-4 py-3 sm:px-6 shrink-0">
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
              PATHIXO EXPO 2026
            </span>
          </div>
        </div>
      </header>

      {/* Centered Arena on Mobile & Desktop */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-6 my-auto">
        <SpinWheel />
      </div>

      {/* Subtle footer */}
      <footer className="relative z-10 border-t border-neutral-900 py-3 text-center shrink-0">
        <p className="font-mono text-[10px] text-neutral-500">
          © 2026 PATHIXO PRIVATE LIMITED • Deterministically Verified Outcomes
        </p>
      </footer>
    </main>
  );
}
