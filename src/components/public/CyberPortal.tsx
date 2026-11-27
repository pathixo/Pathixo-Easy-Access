"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { FloatingSpinBot } from "./FloatingSpinBot";
import {
  Sparkles,
  Zap,
  Instagram,
  Linkedin,
  Facebook,
  ArrowUpRight,
  ShieldCheck,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export function CyberPortal() {
  return (
    <div className="relative min-h-screen bg-[#0a0b0c] text-[#f4f4f5] selection:bg-[#ccff00] selection:text-black">
      {/* Background Cyber Grid / Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#1c222b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="pointer-events-none fixed -top-28 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#ccff00]/5 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-blue-500/5 blur-[140px]" />

      {/* Symmetrically Centered Container */}
      <div className="relative z-10 mx-auto min-h-screen max-w-3xl px-4 py-6 sm:px-6 sm:py-10 flex flex-col justify-between">

        {/* ================= 1. TOP STATUS BAR ================= */}
        <header className="w-full">
          <div className="flex items-center justify-between rounded-full border border-neutral-800 bg-[#141619]/90 px-5 py-3 backdrop-blur-md">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#ccff00]/40 bg-[#161a12] p-1.5 shadow-[0_0_15px_rgba(204,255,0,0.15)]">
                <Image
                  src="/assets/images/pathixo-logo-lime.png"
                  alt="Pathixo Company Logo"
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                />
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-base tracking-tight text-white">
                  {siteConfig.company.brandName}
                </span>
                <span className="hidden sm:inline-block text-xs text-neutral-400 font-medium">
                  Pvt. Ltd.
                </span>
              </div>
            </div>

            {/* Live Exhibition Status Badge */}
            <div className="flex items-center gap-2 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-3.5 py-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ccff00] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ccff00]" />
              </span>
              <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#ccff00]">
                MEERUT TRADE SHOW 2026
              </span>
            </div>
          </div>
        </header>

        {/* ================= 2. MAIN CONTENT ================= */}
        <main className="my-8 flex-1 space-y-8">

          {/* Welcome & Intro Section */}
          <section className="text-center">
            {/* Brand Logo Emblem */}
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-[#ccff00]/50 bg-[#121612] p-2.5 shadow-[0_0_30px_rgba(204,255,0,0.2)]">
              <Image
                src="/assets/images/pathixo-logo-lime.png"
                alt="Pathixo Official Logo"
                width={64}
                height={64}
                className="h-full w-full object-contain drop-shadow"
              />
            </div>

            {/* Monospace Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-4 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-[#ccff00] uppercase mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00]" />
              <span>OFFICIAL BOOTH INTERACTIVE KIOSK</span>
            </div>

            {/* Big Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              HELLO. WE ARE <span className="text-[#ccff00]">PATHIXO.</span>
            </h1>

            {/* Simple Intro Box in Clean Geometry */}
            <div className="mt-5 mx-auto max-w-2xl rounded-2xl sm:rounded-3xl border border-neutral-800 bg-[#121417]/90 p-5 sm:p-6 text-sm text-neutral-300 leading-relaxed text-center sm:text-left shadow-lg">
              <p className="text-neutral-200">
                We design and engineer high-performance web, mobile, and cloud solutions that help visionary enterprises scale and succeed.
              </p>
              <div className="mt-3 flex items-center justify-center sm:justify-start gap-2 text-xs text-neutral-400 border-t border-neutral-800/80 pt-3">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ccff00]" />
                <span>Live booth connection at <strong className="text-white font-medium">Meerut Trade Show 2026</strong></span>
              </div>
            </div>
          </section>

          {/* ================= CORE PLATFORMS (OUTLINED PILL SHAPES) ================= */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
                Featured Platforms & Products
              </span>
            </div>

            <div className="space-y-3.5">

              {/* PLATFORM 1: PATHIXO OFFICIAL WEBSITE */}
              <motion.a
                href={siteConfig.company.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Pathixo official website at pathixo.com"
                whileTap={{ scale: 0.99 }}
                whileHover={{ scale: 1.005 }}
                className="group relative block w-full text-left rounded-3xl sm:rounded-[32px] border-2 border-[#ccff00] bg-[#121417] p-5 sm:p-6 shadow-[0_0_20px_rgba(204,255,0,0.12)] transition-all duration-200 hover:bg-[#161a1a] hover:shadow-[0_0_35px_rgba(204,255,0,0.25)] hover:scale-[1.005]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#ccff00]/50 bg-[#121612] p-2 text-white group-hover:bg-[#ccff00] transition">
                      <Image
                        src="/assets/images/pathixo-logo-lime.png"
                        alt="Pathixo Logo"
                        width={44}
                        height={44}
                        className="h-full w-full object-contain group-hover:brightness-0 transition"
                      />
                    </div>
                    <div>
                      <span className="inline-block rounded-full bg-blue-500/10 border border-blue-500/30 px-2.5 py-0.5 text-[10px] font-bold text-blue-400 uppercase tracking-wide">
                        SMARTER WEB & CLOUD
                      </span>
                      <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-[#ccff00] transition">
                        PATHIXO
                      </h2>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800/90 text-neutral-300 group-hover:border-[#ccff00] group-hover:text-[#ccff00] transition">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </div>

                <p className="mt-3 font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Smarter Web Solutions — Expertly crafted with care by Pathixo. Digital innovation partner specializing in high-performance web development, cloud infrastructure, and user-centric design.
                </p>

                <div className="mt-3.5 flex items-center justify-between border-t border-neutral-800/80 pt-2.5 text-xs text-neutral-400 font-sans">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#ccff00]" />
                    <span className="font-mono text-xs">pathixo.com</span>
                  </span>
                  <span className="text-[#ccff00] font-bold hover:underline">
                    Visit Site ↗
                  </span>
                </div>
              </motion.a>

              {/* PLATFORM 2: VAKXO PRODUCT WEBSITE */}
              <motion.a
                href={siteConfig.products.vakxo.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Explore Vakxo AI Developer Agent at vakxo.pathixo.com"
                whileTap={{ scale: 0.99 }}
                whileHover={{ scale: 1.005 }}
                className="group relative block w-full text-left rounded-3xl sm:rounded-[32px] border-2 border-[#ccff00] bg-[#121417] p-5 sm:p-6 shadow-[0_0_20px_rgba(204,255,0,0.12)] transition-all duration-200 hover:bg-[#161a1a] hover:shadow-[0_0_35px_rgba(204,255,0,0.25)] hover:scale-[1.005]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-700/80 bg-[#0d0e10] p-2 text-white group-hover:border-[#ccff00] transition">
                      <Image
                        src="/assets/images/vakxo-logo.png"
                        alt="Vakxo Logo"
                        width={44}
                        height={44}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="inline-block rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-0.5 text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                        AI DEVELOPER AGENT
                      </span>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-[#ccff00] transition">
                        VAKXO
                      </h3>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800/90 text-neutral-300 group-hover:border-[#ccff00] group-hover:text-[#ccff00] transition">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </div>

                <p className="mt-3 font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Voice-native, local-first autonomous desktop AI developer agent. Speaks intent, writes code, navigates IDEs, and ships tasks.
                </p>

                <div className="mt-3.5 flex items-center justify-between border-t border-neutral-800/80 pt-2.5 text-xs text-neutral-400 font-sans">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <span className="h-2 w-2 rounded-full bg-[#ccff00]" />
                    <span className="font-mono text-xs">vakxo.pathixo.com</span>
                  </span>
                  <span className="text-[#ccff00] font-bold hover:underline">
                    Explore Vakxo ↗
                  </span>
                </div>
              </motion.a>

              {/* PLATFORM 3: krocPDF PRODUCT WEBSITE */}
              <motion.a
                href={siteConfig.products.krocPDF.website}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open krocPDF private document suite at www.krocpdf.app"
                whileTap={{ scale: 0.99 }}
                whileHover={{ scale: 1.005 }}
                className="group relative block w-full text-left rounded-3xl sm:rounded-[32px] border-2 border-[#ccff00] bg-[#121417] p-5 sm:p-6 shadow-[0_0_20px_rgba(204,255,0,0.12)] transition-all duration-200 hover:bg-[#161a1a] hover:shadow-[0_0_35px_rgba(204,255,0,0.25)] hover:scale-[1.005]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-neutral-700/80 bg-[#0d0e10] p-2 text-white group-hover:border-[#ccff00] transition">
                      <Image
                        src="/assets/images/krocpdf-logo.png"
                        alt="krocPDF Logo"
                        width={44}
                        height={44}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div>
                      <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase tracking-wide">
                        PRIVATE DOCUMENT SUITE
                      </span>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-[#ccff00] transition">
                        krocPDF
                      </h3>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800/90 text-neutral-300 group-hover:border-[#ccff00] group-hover:text-[#ccff00] transition">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </div>

                <p className="mt-3 font-sans text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  Every document tool you need, pure & private. Convert, merge, and organize documents on-device with zero tracking.
                </p>

                <div className="mt-3.5 flex items-center justify-between border-t border-neutral-800/80 pt-2.5 text-xs text-neutral-400 font-sans">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-mono text-xs">www.krocpdf.app</span>
                  </span>
                  <span className="text-[#ccff00] font-bold hover:underline">
                    Open Web App ↗
                  </span>
                </div>
              </motion.a>

            </div>
          </section>

          {/* Social Platforms & Direct Contact (Outlined Pill-shaped Buttons) */}
          <section className="space-y-3">
            <div className="text-xs font-semibold tracking-wider text-neutral-300 uppercase px-1">
              Connect With Us
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Instagram */}
              <motion.a
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                href={siteConfig.company.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Follow Pathixo on Instagram"
                className="flex items-center justify-between rounded-2xl sm:rounded-full border-2 border-neutral-700/80 bg-[#141619] px-4 py-3 text-white transition hover:border-[#ccff00] hover:bg-[#181b20]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <Instagram className="h-4 w-4" />
                  </div>
                  <div className="text-left truncate">
                    <div className="text-xs font-bold uppercase text-white truncate">Instagram</div>
                    <div className="text-[10px] text-neutral-400 truncate">@pathixopvtltd</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-400" />
              </motion.a>

              {/* LinkedIn */}
              <motion.a
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                href={siteConfig.company.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Connect with Pathixo on LinkedIn"
                className="flex items-center justify-between rounded-2xl sm:rounded-full border-2 border-neutral-700/80 bg-[#141619] px-4 py-3 text-white transition hover:border-[#ccff00] hover:bg-[#181b20]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Linkedin className="h-4 w-4" />
                  </div>
                  <div className="text-left truncate">
                    <div className="text-xs font-bold uppercase text-white truncate">LinkedIn</div>
                    <div className="text-[10px] text-neutral-400 truncate">Pathixo Pvt Ltd</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-400" />
              </motion.a>

              {/* Facebook */}
              <motion.a
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                href={siteConfig.company.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Visit Pathixo on Facebook"
                className="flex items-center justify-between rounded-2xl sm:rounded-full border-2 border-neutral-700/80 bg-[#141619] px-4 py-3 text-white transition hover:border-[#ccff00] hover:bg-[#181b20]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20">
                    <Facebook className="h-4 w-4" />
                  </div>
                  <div className="text-left truncate">
                    <div className="text-xs font-bold uppercase text-white truncate">Facebook</div>
                    <div className="text-[10px] text-neutral-400 truncate">Pathixo Pvt Ltd</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-400" />
              </motion.a>

              {/* Direct Email Link */}
              <motion.a
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                href={`mailto:${siteConfig.company.email}?subject=Inquiry%20from%20Meerut%20Trade%20Show%202026&body=Hello%20Pathixo%20Team,%0A%0AI%20connected%20with%20you%20at%20the%20Meerut%20Trade%20Show%202026%20and%20would%20like%20to%20learn%20more%20about%20your%20services.`}
                aria-label="Send direct inquiry email to Pathixo founder"
                className="flex items-center justify-between rounded-2xl sm:rounded-full border-2 border-neutral-700/80 bg-[#141619] px-4 py-3 text-white transition hover:border-[#ccff00] hover:bg-[#181b20]"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="text-left truncate">
                    <div className="text-xs font-bold uppercase text-white truncate">Email Us</div>
                    <div className="text-[10px] text-neutral-400 truncate">{siteConfig.company.email}</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0 text-neutral-400" />
              </motion.a>
            </div>
          </section>

          {/* Stall Lucky Draw Card */}
          <section>
            <Link
              href="/spin"
              className="group block rounded-3xl sm:rounded-[32px] border-2 border-dashed border-[#ccff00]/50 bg-[#ccff00]/5 p-5 text-center transition hover:border-[#ccff00] hover:bg-[#ccff00]/10"
            >
              <div className="flex items-center justify-center gap-2.5">
                <Sparkles className="h-5 w-5 text-[#ccff00]" />
                <span className="font-mono text-sm sm:text-base font-black uppercase text-white group-hover:text-[#ccff00] transition">
                  STALL LUCKY DRAW • SPIN & WIN
                </span>
              </div>
              <p className="mt-1.5 font-mono text-xs text-neutral-400">
                Register to spin the wheel and win exclusive stall vouchers, cloud credits, and software perks!
              </p>
              <div className="mt-3 inline-flex items-center gap-1 font-mono text-xs font-bold text-[#ccff00] underline underline-offset-4">
                <span>Enter Spin & Win Arena</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </div>
            </Link>
          </section>

        </main>

        {/* ================= 3. FOOTER (WITH ACCURATE OFFICES FROM LIVE SITE) ================= */}
        <footer className="mt-10 border-t border-[#252a31] pt-6 pb-3 text-center space-y-3.5">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 font-mono text-xs text-neutral-400">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-[#ccff00]" />
              <span>Offices: Greater Noida • New Delhi • Howrah</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-[#ccff00]" />
              <span>{siteConfig.company.email}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="h-3.5 w-3.5 text-[#ccff00]" />
              <span>{siteConfig.company.displayPhone}</span>
            </span>
          </div>

          <div className="text-[11px] text-neutral-500 font-mono">
            Exhibition Pavilion: Meerut Trade Show Ground • Pathixo Booth
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs text-neutral-500 pt-3 border-t border-[#1a1e24]">
            <div className="flex items-center gap-2">
              <Image
                src="/assets/images/pathixo-logo-lime.png"
                alt="Pathixo"
                width={16}
                height={16}
                className="h-4 w-4 object-contain opacity-80"
              />
              <p>© 2026 {siteConfig.company.legalName}</p>
            </div>
            <div className="flex items-center gap-4 text-neutral-400">
              <Link href="/privacy" className="hover:text-[#ccff00]">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-[#ccff00]">Terms & Conditions</Link>
            </div>
          </div>
        </footer>

      </div>

      {/* Interactive Draggable Floating Spin & Win Chatbot Widget */}
      <FloatingSpinBot />
    </div>
  );
}
