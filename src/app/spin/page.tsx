import type { Metadata } from "next";
import Link from "next/link";
import { SpinWheel } from "@/components/public/SpinWheel";
import { ArrowLeft, Sparkles } from "lucide-react";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Stall Lucky Draw • Spin & Win — Pathixo",
  description: "Participate in Pathixo's exclusive exhibition lucky draw and win tech vouchers, credits, and consultations.",
};

export default function SpinPage() {
  return (
    <main className="relative min-h-screen bg-[#0a0b0c] text-[#f4f4f5] selection:bg-[#ccff00] selection:text-black">
      {/* Background Cyber Grid / Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#1c222b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="pointer-events-none fixed -top-28 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-[#ccff00]/5 blur-[120px]" />

      {/* Top HUD Navigation Bar */}
      <header className="relative z-10 border-b border-[#252a31] bg-[#141619]/90 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-md items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-neutral-400 transition hover:text-[#ccff00]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>PORTAL HOME</span>
          </Link>
          <div className="flex items-center gap-1.5 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-2.5 py-0.5">
            <Sparkles className="h-3 w-3 text-[#ccff00]" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#ccff00]">
              {siteConfig.expo.eventName.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      {/* Main Wheel Viewport */}
      <div className="relative z-10 py-4 sm:py-8">
        <SpinWheel />
      </div>
    </main>
  );
}
