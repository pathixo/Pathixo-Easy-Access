import type { Metadata } from "next";
import Link from "next/link";
import { SpinWheel } from "@/components/public/SpinWheel";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Spin & Win Lucky Draw — Pathixo Expo",
  description: "Participate in Pathixo's exclusive exhibition lucky draw and win tech vouchers, credits, and consultations.",
};

export default function SpinPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0b0c] text-[#f4f4f5] flex flex-col justify-between selection:bg-[#ccff00] selection:text-black">
      {/* Background Cyber Grid / Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#1c222b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="pointer-events-none fixed -top-28 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#ccff00]/5 blur-[140px]" />

      {/* Top back navigation */}
      <header className="relative z-10 border-b border-white/10 bg-[#0e1013]/90 backdrop-blur-md px-4 py-3 sm:px-6 shrink-0">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 transition hover:text-[#ccff00]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Pathixo Home</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
            <span className="text-xs font-mono font-bold text-[#ccff00]">MEERUT TRADE SHOW 2026</span>
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
