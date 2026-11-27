import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { TestSpinSandbox } from "@/components/public/TestSpinSandbox";

export const metadata: Metadata = {
  title: "Spin & Win Simulator & Testing Lab — Pathixo Expo",
  description: "Test lucky draw runs, spins, and probability distributions unlimited times in local development.",
};

export default function TestSpinPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0b0c] text-[#f4f4f5] flex flex-col justify-between selection:bg-[#ccff00] selection:text-black">
      {/* Background Cyber Grid */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#1c222b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="pointer-events-none fixed -top-28 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#ccff00]/5 blur-[140px]" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-[#0e1013]/90 backdrop-blur-md px-4 py-3 sm:px-6 shrink-0">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-white/10 bg-[#141619] px-3 font-mono text-xs font-bold uppercase text-neutral-300 transition hover:border-[#ccff00] hover:text-[#ccff00]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Portal Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="rounded-full bg-[#ccff00]/10 border border-[#ccff00]/40 px-2.5 py-1 font-mono text-[10px] font-bold text-[#ccff00]">
              DEV SIMULATOR ACTIVE
            </span>
          </div>
        </div>
      </header>

      {/* Main Testing Lab Arena */}
      <div className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <TestSpinSandbox />
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-neutral-900 py-3 text-center shrink-0">
        <p className="font-mono text-[10px] text-neutral-500">
          PATHIXO EXPO 2026 • Local Simulator Sandbox • No Visitor Limitations
        </p>
      </footer>
    </main>
  );
}
