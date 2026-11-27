"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { siteConfig } from "@/config/site";
import { VisitorPassModal } from "./VisitorPassModal";
import { FloatingSpinBot } from "./FloatingSpinBot";
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
  CheckCircle2,
  MapPin,
  Mail,
  Phone,
} from "lucide-react";

export function CyberPortal() {
  const [isRegistered, setIsRegistered] = useState(false);
  const [visitorName, setVisitorName] = useState("");
  const hasInteractedRef = useRef<boolean>(false);

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

  // Check visitor registration status on mount and verify server session
  useEffect(() => {
    let isMounted = true;

    // 1. Handle recovery URL before accessing localStorage so storage failures cannot prevent check-in from opening
    let isRecoveryRequested = false;
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        isRecoveryRequested =
          params.get("register") === "true" || window.location.hash === "#register";
      }
    } catch {
      // Ignore URL parsing errors
    }

    if (isRecoveryRequested) {
      hasInteractedRef.current = true;
      setModalState({
        isOpen: true,
        name: "Stall Visitor Check-In",
        url: siteConfig.company.website,
      });
      return;
    }

    // 2. Catch failures from px_visitor_registered and px_visitor_name reads separately,
    // treating them as missing registration while preserving the recovery flow.
    let storedReg: string | null = null;
    try {
      storedReg = localStorage.getItem("px_visitor_registered");
    } catch {
      storedReg = null;
    }

    let storedName: string | null = null;
    try {
      storedName = localStorage.getItem("px_visitor_name");
    } catch {
      storedName = null;
    }

    if (storedReg === "true") {
      setIsRegistered(true);
      if (storedName) setVisitorName(storedName);

      // Verify that server session cookie is still valid before user attempts to spin
      fetch("/api/spin/result")
        .then((res) => {
          // Cleanup guard: ignore responses after effect has been cleaned up
          if (!isMounted) return;

          if (res.status === 401) {
            // Session expired on server while localStorage is true:
            // Clear stale local flag so visitor can restore session before spinning
            try {
              localStorage.removeItem("px_visitor_registered");
            } catch {}
            setIsRegistered(false);
          }
        })
        .catch(() => {
          // Keep existing state on network errors
        });
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleRegisterSuccess = (name: string) => {
    setIsRegistered(true);
    setVisitorName(name);
  };

  const handleCloseModal = () => {
    hasInteractedRef.current = true;
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handlePlatformClick = (name: string, url: string, category?: string) => {
    hasInteractedRef.current = true;

    if (isRegistered) {
      // 1-Tap direct opening once registered
      window.open(url, "_blank", "noopener,noreferrer");
    } else {
      // Unregistered: open registration pass preserving the target destination URL
      setModalState({
        isOpen: true,
        name,
        url,
        category,
      });
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0b0c] text-[#f4f4f5] selection:bg-[#ccff00] selection:text-black">
      {/* Background Cyber Grid / Ambient Glow */}
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(#1c222b_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      <div className="pointer-events-none fixed -top-28 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-[#ccff00]/5 blur-[140px]" />
      <div className="pointer-events-none fixed bottom-0 left-1/2 -translate-x-1/2 h-80 w-80 rounded-full bg-blue-500/5 blur-[140px]" />

      {/* Symmetrically Centered Container */}
      <div className="relative z-10 mx-auto min-h-screen max-w-3xl px-4 py-6 sm:px-6 sm:py-10 flex flex-col justify-between">
        
        {/* ================= 1. TOP HUD STATUS BAR ================= */}
        <header className="w-full">
          <div className="flex items-center justify-between rounded-full border border-[#252a31] bg-[#141619]/90 px-5 py-3 backdrop-blur-md">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#ccff00] text-black font-black text-sm shadow-cyber-sm">
                ◆
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-base font-black tracking-wider text-white">
                  {siteConfig.company.brandName}
                </span>
                <span className="hidden sm:inline-block font-mono text-[10px] text-neutral-400">
                  {"// PRIVATE LIMITED"}
                </span>
              </div>
            </div>

            {/* Live Exhibition Status or Verified Pass Badge */}
            {isRegistered ? (
              <div className="flex items-center gap-1.5 rounded-full border border-[#ccff00]/40 bg-[#ccff00]/15 px-3 py-1">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#ccff00]" />
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#ccff00]">
                  VERIFIED VISITOR {visitorName ? `• ${visitorName.split(" ")[0]}` : ""}
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-3.5 py-1">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ccff00] opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ccff00]" />
                </span>
                <span className="font-mono text-[10px] sm:text-xs font-bold uppercase tracking-wider text-[#ccff00]">
                  MEERUT TRADE SHOW 2026
                </span>
              </div>
            )}
          </div>
        </header>

        {/* ================= 2. MAIN CONTENT ================= */}
        <main className="my-8 flex-1 space-y-8">
          
          {/* Welcome & Intro Section */}
          <section className="text-center">
            {/* Monospace Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-4 py-1.5 font-mono text-[11px] font-semibold tracking-wide text-[#ccff00] uppercase mb-3">
              <span className="h-1.5 w-1.5 rounded-full bg-[#ccff00]" />
              <span>OFFICIAL BOOTH INTERACTIVE KIOSK</span>
            </div>

            {/* Big Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight text-white leading-tight">
              HELLO. WE ARE <span className="text-[#ccff00]">PATHIXO.</span>
            </h1>

            {/* Simple Intro Box in Pill-like geometry */}
            <div className="mt-4 mx-auto max-w-2xl rounded-3xl border border-[#252a31] bg-[#121417] p-5 font-mono text-xs sm:text-sm text-neutral-300 leading-relaxed text-left space-y-2">
              <p className="flex items-start gap-2">
                <span className="text-[#ccff00] font-bold">›</span>
                <span>We design and build smarter web, mobile, and cloud solutions that help visionary businesses scale and succeed.</span>
              </p>
              <p className="flex items-start gap-2 text-neutral-400">
                <span className="text-[#ccff00] font-bold">›</span>
                <span>Glad to connect with you live at the <strong className="text-white">Meerut Trade Show 2026</strong>.</span>
              </p>
            </div>
          </section>

          {/* ================= CORE PLATFORMS (UNIFORM PILL-LIKE SHAPE, NO ASYMMETRIC HIGHLIGHT) ================= */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <span className="font-mono text-xs font-bold tracking-widest text-neutral-400 uppercase">
                {"// OFFICIAL PLATFORMS & PRODUCTS"}
              </span>
              <span className="font-mono text-[11px] text-[#ccff00] uppercase">
                {isRegistered ? "1-TAP DIRECT ACCESS" : "CHECK-IN TO UNLOCK"}
              </span>
            </div>

            <div className="space-y-3.5">
              
              {/* PLATFORM 1: PATHIXO OFFICIAL WEBSITE */}
              <motion.button
                whileTap={{ scale: 0.99 }}
                whileHover={{ scale: 1.005 }}
                onClick={() =>
                  handlePlatformClick(
                    "Pathixo Official Website",
                    siteConfig.company.website,
                    "Corporate Platform"
                  )
                }
                className="group relative w-full text-left rounded-3xl sm:rounded-[32px] border border-[#252a31] bg-[#141619] p-5 sm:p-6 transition hover:border-[#ccff00] hover:bg-[#181b20]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-800 text-white group-hover:bg-[#ccff00] group-hover:text-black transition">
                      <Globe className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="inline-block rounded-full bg-blue-500/10 border border-blue-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-400 uppercase">
                        SMARTER WEB & CLOUD
                      </span>
                      <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-[#ccff00] transition">
                        PATHIXO.COM
                      </h2>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-neutral-300 group-hover:border-[#ccff00] group-hover:text-[#ccff00] transition">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </div>

                <p className="mt-2.5 font-mono text-xs sm:text-sm text-neutral-300">
                  Digital innovation partner specializing in high-performance web development, cloud infrastructure, and user-centric design.
                </p>

                <div className="mt-3.5 flex items-center justify-between border-t border-[#252a31] pt-2.5 font-mono text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-[#ccff00]" />
                    <span>pathixo.com</span>
                  </span>
                  <span className="text-[#ccff00] font-bold underline underline-offset-2">
                    {isRegistered ? "Visit Site ↗" : "Register & Visit ↗"}
                  </span>
                </div>
              </motion.button>

              {/* PLATFORM 2: VAKXO PRODUCT WEBSITE */}
              <motion.button
                whileTap={{ scale: 0.99 }}
                whileHover={{ scale: 1.005 }}
                onClick={() =>
                  handlePlatformClick(
                    "Vakxo (Building Vakxo)",
                    siteConfig.products.vakxo.website,
                    "AI Dev Agent"
                  )
                }
                className="group relative w-full text-left rounded-3xl sm:rounded-[32px] border border-[#252a31] bg-[#141619] p-5 sm:p-6 transition hover:border-[#ccff00] hover:bg-[#181b20]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-800 text-white group-hover:bg-[#ccff00] group-hover:text-black transition">
                      <Zap className="h-5 w-5 fill-current stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="inline-block rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-purple-300 uppercase">
                        AI DEVELOPER AGENT
                      </span>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-[#ccff00] transition">
                        VAKXO
                      </h3>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-neutral-300 group-hover:border-[#ccff00] group-hover:text-[#ccff00] transition">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </div>

                <p className="mt-2.5 font-mono text-xs sm:text-sm text-neutral-300">
                  Voice-native, local-first autonomous desktop AI developer agent. Speaks intent, writes code, navigates IDEs, and ships tasks.
                </p>

                <div className="mt-3.5 flex items-center justify-between border-t border-[#252a31] pt-2.5 font-mono text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <span className="h-2 w-2 rounded-full bg-[#ccff00]" />
                    <span>vakxo.pathixo.com</span>
                  </span>
                  <span className="text-[#ccff00] font-bold underline underline-offset-2">
                    {isRegistered ? "Explore Vakxo ↗" : "Register & Visit ↗"}
                  </span>
                </div>
              </motion.button>

              {/* PLATFORM 3: krocPDF PRODUCT WEBSITE */}
              <motion.button
                whileTap={{ scale: 0.99 }}
                whileHover={{ scale: 1.005 }}
                onClick={() =>
                  handlePlatformClick(
                    "krocPDF",
                    siteConfig.products.krocPDF.website,
                    "Document Suite"
                  )
                }
                className="group relative w-full text-left rounded-3xl sm:rounded-[32px] border border-[#252a31] bg-[#141619] p-5 sm:p-6 transition hover:border-[#ccff00] hover:bg-[#181b20]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-800 text-white group-hover:bg-[#ccff00] group-hover:text-black transition">
                      <FileText className="h-5 w-5 stroke-[2.2]" />
                    </div>
                    <div>
                      <span className="inline-block rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-400 uppercase">
                        PRIVATE DOCUMENT SUITE
                      </span>
                      <h3 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white group-hover:text-[#ccff00] transition">
                        krocPDF
                      </h3>
                    </div>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border border-neutral-700 bg-neutral-800 text-neutral-300 group-hover:border-[#ccff00] group-hover:text-[#ccff00] transition">
                    <ArrowUpRight className="h-4 w-4 stroke-[2.5]" />
                  </div>
                </div>

                <p className="mt-2.5 font-mono text-xs sm:text-sm text-neutral-300">
                  Every document tool you need, pure & private. Convert, merge, and organize documents on-device with zero tracking.
                </p>

                <div className="mt-3.5 flex items-center justify-between border-t border-[#252a31] pt-2.5 font-mono text-xs text-neutral-400">
                  <span className="flex items-center gap-1.5 text-neutral-400">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span>krocpdf.app</span>
                  </span>
                  <span className="text-[#ccff00] font-bold underline underline-offset-2">
                    {isRegistered ? "Open Web App ↗" : "Register & Visit ↗"}
                  </span>
                </div>
              </motion.button>

            </div>
          </section>

          {/* Social Platforms (Uniform Pill-shaped Buttons) */}
          <section className="space-y-3">
            <div className="font-mono text-xs font-bold tracking-widest text-neutral-400 uppercase px-2">
              {"// CONNECT ON SOCIAL"}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Instagram */}
              <motion.a
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                href={siteConfig.company.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-full border border-[#252a31] bg-[#141619] px-5 py-3.5 text-white transition hover:border-[#ccff00] hover:text-[#ccff00]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20">
                    <Instagram className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-xs font-bold uppercase text-white">INSTAGRAM</div>
                    <div className="font-mono text-[10px] text-neutral-400">@pathixopvtltd</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-neutral-400" />
              </motion.a>

              {/* LinkedIn */}
              <motion.a
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                href={siteConfig.company.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-full border border-[#252a31] bg-[#141619] px-5 py-3.5 text-white transition hover:border-[#ccff00] hover:text-[#ccff00]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                    <Linkedin className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-xs font-bold uppercase text-white">LINKEDIN</div>
                    <div className="font-mono text-[10px] text-neutral-400">Pathixo Pvt Ltd</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-neutral-400" />
              </motion.a>

              {/* Facebook */}
              <motion.a
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                href={siteConfig.company.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-full border border-[#252a31] bg-[#141619] px-5 py-3.5 text-white transition hover:border-[#ccff00] hover:text-[#ccff00]"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600/10 text-blue-400 border border-blue-600/20">
                    <Facebook className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-mono text-xs font-bold uppercase text-white">FACEBOOK</div>
                    <div className="font-mono text-[10px] text-neutral-400">Pathixo Pvt Ltd</div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 text-neutral-400" />
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
                Registered visitors get 1 turn to win exclusive stall vouchers and software discounts.
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
              <span>Meerut Trade Show Ground • Pathixo Pavilion</span>
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

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-xs text-neutral-500 pt-3 border-t border-[#1a1e24]">
            <p>© 2026 {siteConfig.company.legalName}</p>
            <div className="flex items-center gap-4 text-neutral-400">
              <Link href="/privacy" className="hover:text-[#ccff00]">Privacy Policy</Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-[#ccff00]">Terms & Conditions</Link>
            </div>
          </div>
        </footer>

      </div>

      {/* Upfront Visitor Registration Window */}
      <VisitorPassModal
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        onRegisterSuccess={handleRegisterSuccess}
        targetDestination={{
          name: modalState.name,
          url: modalState.url,
          category: modalState.category,
        }}
      />

      {/* Interactive Draggable Floating Spin & Win Chatbot Widget */}
      <FloatingSpinBot
        isRegistered={isRegistered}
        visitorName={visitorName}
        isModalOpen={modalState.isOpen}
        onOpenRegister={() => {
          hasInteractedRef.current = true;
          setModalState({
            isOpen: true,
            name: "Stall Lucky Draw",
            url: "/spin",
          });
        }}
      />
    </div>
  );
}
