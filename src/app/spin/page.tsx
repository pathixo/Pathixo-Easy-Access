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
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5]">
      {/* Top back navigation */}
      <div className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Pathixo Home</span>
          </Link>
          <span className="text-xs font-mono text-brand-400">PATHIXO EXPO MART</span>
        </div>
      </div>

      <div className="py-6 sm:py-12">
        <SpinWheel />
      </div>
    </main>
  );
}
