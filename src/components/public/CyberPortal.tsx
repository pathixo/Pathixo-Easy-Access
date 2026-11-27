"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { VisitorPassModal } from "./VisitorPassModal";
import {
  Globe,
  Sparkles,
  Zap,
  FileText,
  Instagram,
  Linkedin,
  Facebook,
  ArrowUpRight,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

export function CyberPortal() {
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    name: string;
    url: string;
    category?: string;
  }>({
    isOpen: false,
    name: "Pathixo",
    url: siteConfig.company.website,
  });

  const handleOpenRegistration = (name: string, url: string, category?: string) => {
    setModalState({
      isOpen: true,
      name,
      url,
      category,
    });
  };

  return (
    <div className="relative min-h-screen bg-[#0a0b0c] text-[#f4f4f5] selection:bg-[#ccff00] selection:text-black">
      {/* Background Cyber Grid / Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#1c222b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="pointer-events-none fixed -top-28 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-[#ccff00]/5 blur-[120px]" />

      {/* Mobile-first centered frame: full width on mobile (360-430px), centered max-w-md on desktop */}
      <main className="relative z-10 mx-auto max-w-md min-h-screen flex flex-col justify-between px-4 py-5 sm:px-6 sm:py-8">
        
        {/* Top HUD Status Bar */}
        <header className="w-full">
          <div className="flex items-center justify-between rounded-xl border border-[#252a31] bg-[#141619]/90 px-3.5 py-2.5 backdrop-blur-md">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#ccff00] text-black font-black text-xs shadow-cyber-sm">
                ◆
              </div>
              <span className="font-mono text-sm font-black tracking-wider text-white">
                {siteConfig.company.brandName}
              </span>
            </div>

            {/* Live Exhibition Status Badge */}
            <div className="flex items-center gap-1.5 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-2.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ccff00] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ccff00]" />
              </span>
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#ccff00]">
                MEERUT TRADE SHOW
              </span>
            </div>
          </div>
        </header>

        {/* Hero Section: Welcome & Trade Show Intro */}
        <section className="mt-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {/* Terminal Monospace Pre-heading */}
            <div className="inline-block font-mono text-[11px] font-semibold tracking-wide text-[#ccff00] uppercase mb-1">
              // WELCOME TO PATHIXO LIVE BOOTH
            </div>

            {/* Big Impact Headline */}
            <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl leading-none">
              HELLO. WE ARE <span className="text-[#ccff00]">PATHIXO.</span>
            </h1>

            {/* Simple Intro */}
            <div className="mt-3 rounded-xl border border-[#252a31] bg-[#121417] p-3.5 font-mono text-xs text-neutral-300 leading-relaxed space-y-1.5">
              <p className="flex items-start gap-1.5">
                <span className="text-[#ccff00] font-bold">›</span>
                <span>We build intelligent digital products and engineer custom software solutions.</span>
              </p>
              <p className="flex items-start gap-1.5 text-neutral-400">
                <span className="text-[#ccff00] font-bold">›</span>
                <span>Glad to connect with you at the <strong className="text-white">Meerut Trade Show 2026</strong>.</span>
              </p>
            </div>
          </motion.div>
        </section>

        {/* CORE HIGHLIGHTED WEBSITES (Triggers Registration Window) */}
        <section className="mt-6 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
              // HIGHLIGHTED PLATFORMS
            </span>
            <span className="font-mono text-[10px] text-[#ccff00] uppercase">
              TAP TO UNLOCK ACCESS
            </span>
          </div>

          {/* 1. MAIN COMPANY WEBSITE (Primary Highlight) */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleOpenRegistration(
                "Pathixo Official Website",
                siteConfig.company.website,
                "Company Platform"
              )
            }
            className="group relative w-full text-left rounded-2xl border-2 border-[#ccff00] bg-[#141619] p-4 shadow-cyber transition hover:bg-[#1a1e24] active:shadow-none"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#ccff00] text-black">
                  <Globe className="h-5 w-5 stroke-[2.5]" />
                </div>
                <div>
                  <span className="inline-block rounded-md bg-[#ccff00]/20 px-2 py-0.5 font-mono text-[10px] font-bold text-[#ccff00] uppercase">
                    PRIMARY HUB
                  </span>
                  <h2 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-[#ccff00] transition">
                    PATHIXO.COM
                  </h2>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#ccff00]/40 bg-[#ccff00]/10 text-[#ccff00] group-hover:bg-[#ccff00] group-hover:text-black transition">
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>

            <p className="mt-2.5 font-mono text-xs text-neutral-300">
              Explore our full-stack web engineering, custom AI solutions, and enterprise software services.
            </p>

            <div className="mt-3 flex items-center justify-between border-t border-[#252a31] pt-2 font-mono text-[11px] text-[#ccff00]">
              <span className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Verified Official Site</span>
              </span>
              <span className="font-bold underline underline-offset-2">Register & Visit ↗</span>
            </div>
          </motion.button>

          {/* 2. MAIN PRODUCT WEBSITE: VAKXO */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleOpenRegistration(
                "Vakxo (Building Vakxo)",
                siteConfig.products.vakxo.website,
                "AI Dev Agent"
              )
            }
            className="group relative w-full text-left rounded-2xl border-2 border-white/20 bg-[#121417] p-4 transition hover:border-[#ccff00] hover:bg-[#181b20]"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-black font-black">
                  <Zap className="h-5 w-5 fill-current stroke-[2.5]" />
                </div>
                <div>
                  <span className="inline-block rounded-md bg-white/10 px-2 py-0.5 font-mono text-[10px] font-bold text-white uppercase">
                    FEATURED AI PRODUCT
                  </span>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-[#ccff00] transition">
                    VAKXO
                  </h3>
                </div>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-white/20 bg-neutral-800 text-white group-hover:border-[#ccff00] group-hover:text-[#ccff00] transition">
                <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
              </div>
            </div>

            <p className="mt-2 font-mono text-xs text-neutral-300">
              World&apos;s first voice-native autonomous dev agent. Speak your intent — it writes code, controls desktop, and ships.
            </p>

            {/* Gamified Stat Badges (from your design) */}
            <div className="mt-3 grid grid-cols-3 gap-1.5 border-t border-[#252a31] pt-2.5">
              <div className="rounded-lg bg-[#0c0d0e] p-1.5 text-center border border-[#252a31]">
                <div className="font-mono text-xs font-black text-[#ccff00]">3x</div>
                <div className="font-mono text-[9px] text-neutral-400">FASTER DEV</div>
              </div>
              <div className="rounded-lg bg-[#0c0d0e] p-1.5 text-center border border-[#252a31]">
                <div className="font-mono text-xs font-black text-[#ccff00]">0</div>
                <div className="font-mono text-[9px] text-neutral-400">SWITCHES</div>
              </div>
              <div className="rounded-lg bg-[#0c0d0e] p-1.5 text-center border border-[#252a31]">
                <div className="font-mono text-xs font-black text-[#ccff00]">38s</div>
                <div className="font-mono text-[9px] text-neutral-400">AVG TASK</div>
              </div>
            </div>
          </motion.button>

          {/* 3. ENTERPRISE PRODUCT: krocPDF */}
          <motion.button
            whileTap={{ scale: 0.98 }}
            onClick={() =>
              handleOpenRegistration(
                "krocPDF",
                siteConfig.products.krocPDF.website,
                "Document AI"
              )
            }
            className="group relative w-full text-left rounded-2xl border border-[#252a31] bg-[#121417] p-3.5 transition hover:border-[#ccff00] hover:bg-[#181b20]"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-neutral-800 text-neutral-200">
                  <FileText className="h-4 w-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold uppercase tracking-wide text-white group-hover:text-[#ccff00] transition">
                    krocPDF
                  </h4>
                  <p className="font-mono text-[11px] text-neutral-400">
                    Fast, secure enterprise document & PDF intelligence.
                  </p>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-neutral-500 group-hover:text-[#ccff00] transition" />
            </div>
          </motion.button>
        </section>

        {/* BIG CHUNKY SOCIAL PLATFORM BUTTONS */}
        <section className="mt-6">
          <div className="font-mono text-[11px] font-bold tracking-widest text-neutral-400 uppercase mb-3">
            // CONNECT ON SOCIAL
          </div>

          <div className="space-y-2.5">
            {/* Instagram */}
            <motion.a
              whileTap={{ scale: 0.98 }}
              href={siteConfig.company.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-13 w-full items-center justify-between rounded-xl border border-[#252a31] bg-[#141619] px-4 py-3 text-white transition hover:border-[#ccff00] hover:text-[#ccff00]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20">
                  <Instagram className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-mono text-xs font-bold uppercase text-white">INSTAGRAM</div>
                  <div className="font-mono text-[10px] text-neutral-400">@pathixo</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-neutral-400" />
            </motion.a>

            {/* LinkedIn */}
            <motion.a
              whileTap={{ scale: 0.98 }}
              href={siteConfig.company.linkedIn}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-13 w-full items-center justify-between rounded-xl border border-[#252a31] bg-[#141619] px-4 py-3 text-white transition hover:border-[#ccff00] hover:text-[#ccff00]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Linkedin className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-mono text-xs font-bold uppercase text-white">LINKEDIN</div>
                  <div className="font-mono text-[10px] text-neutral-400">Pathixo Private Limited</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-neutral-400" />
            </motion.a>

            {/* Facebook */}
            <motion.a
              whileTap={{ scale: 0.98 }}
              href={siteConfig.company.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-13 w-full items-center justify-between rounded-xl border border-[#252a31] bg-[#141619] px-4 py-3 text-white transition hover:border-[#ccff00] hover:text-[#ccff00]"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/10 text-blue-400 border border-blue-600/20">
                  <Facebook className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <div className="font-mono text-xs font-bold uppercase text-white">FACEBOOK</div>
                  <div className="font-mono text-[10px] text-neutral-400">Pathixo Official</div>
                </div>
              </div>
              <ArrowUpRight className="h-4 w-4 text-neutral-400" />
            </motion.a>
          </div>
        </section>

        {/* LUCKY DRAW / SPIN & WIN CARD */}
        <section className="mt-6">
          <Link
            href="/spin"
            className="group block rounded-2xl border-2 border-dashed border-[#ccff00]/60 bg-[#ccff00]/5 p-4 text-center transition hover:border-[#ccff00] hover:bg-[#ccff00]/10"
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="h-5 w-5 text-[#ccff00]" />
              <span className="font-mono text-sm font-black uppercase text-white group-hover:text-[#ccff00] transition">
                STALL LUCKY DRAW • SPIN & WIN
              </span>
            </div>
            <p className="mt-1 font-mono text-[11px] text-neutral-400">
              Registered visitors get 1 spin to win exclusive stall vouchers and tech perks.
            </p>
          </Link>
        </section>

        {/* Minimal Footer */}
        <footer className="mt-8 border-t border-[#252a31] pt-4 pb-2 text-center">
          <p className="font-mono text-[11px] text-neutral-500">
            © 2026 {siteConfig.company.legalName} • Meerut Trade Show
          </p>
          <div className="mt-1.5 flex items-center justify-center gap-4 font-mono text-[11px] text-neutral-400">
            <Link href="/privacy" className="hover:text-[#ccff00]">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#ccff00]">Terms & Conditions</Link>
          </div>
        </footer>

      </main>

      {/* Interactive Registration Window */}
      <VisitorPassModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        targetDestination={{
          name: modalState.name,
          url: modalState.url,
          category: modalState.category,
        }}
      />
    </div>
  );
}
