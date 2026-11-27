"use client";

import { siteConfig } from "@/config/site";
import { Sparkles, ArrowRight, ShieldCheck, Zap, Layers } from "lucide-react";

interface HeroProps {
  onOpenInquiry: () => void;
}

export function Hero({ onOpenInquiry }: HeroProps) {
  const scrollToRegister = () => {
    const el = document.getElementById("register");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-brand-500/15 blur-3xl" />

      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6">
        {/* Booth Location Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-neutral-300">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400" />
          <span>India Expo Centre & Mart • Visit Pathixo Booth</span>
        </div>

        {/* Main Headline */}
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl">
          Intelligent Digital Products. <br />
          <span className="bg-gradient-to-r from-brand-400 via-brand-300 to-white bg-clip-text text-transparent">
            Scalable Engineering.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto mt-5 max-w-2xl text-base text-neutral-400 sm:text-lg">
          {siteConfig.company.tagline} We transform complex ideas into resilient, production-ready AI products and bespoke enterprise software.
        </p>

        {/* Primary CTAs */}
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <button
            onClick={scrollToRegister}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-6 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 active:scale-95 sm:w-auto"
          >
            <Sparkles className="h-4 w-4" />
            <span>Register & Spin to Win</span>
            <ArrowRight className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenInquiry}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-6 font-semibold text-neutral-200 transition hover:bg-white/10 active:scale-95 sm:w-auto"
          >
            <span>Discuss Your Project</span>
          </button>
        </div>

        {/* Trust & Performance Pillars */}
        <div className="mt-12 grid grid-cols-3 gap-2 border-t border-white/10 pt-8 text-neutral-400 sm:gap-4">
          <div className="flex flex-col items-center gap-1.5">
            <ShieldCheck className="h-5 w-5 text-brand-400" />
            <span className="text-xs font-semibold text-white sm:text-sm">Zero-Trust Security</span>
            <span className="text-[11px] text-neutral-500">Enterprise Standards</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Zap className="h-5 w-5 text-brand-400" />
            <span className="text-xs font-semibold text-white sm:text-sm">Ultra-Fast 4G UI</span>
            <span className="text-[11px] text-neutral-500">Sub-Second Load</span>
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Layers className="h-5 w-5 text-brand-400" />
            <span className="text-xs font-semibold text-white sm:text-sm">Full-Stack AI</span>
            <span className="text-[11px] text-neutral-500">From Design to Cloud</span>
          </div>
        </div>
      </div>
    </section>
  );
}
