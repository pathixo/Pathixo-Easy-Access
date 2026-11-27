"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Sparkles, MessageSquare } from "lucide-react";

interface NavbarProps {
  onOpenInquiry: () => void;
}

export function Navbar({ onOpenInquiry }: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand Logo & Event Pill */}
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 font-extrabold text-white shadow-lg shadow-brand-600/20">
              P
            </span>
            <span>{siteConfig.company.brandName}</span>
          </Link>
          <span className="hidden items-center gap-1 rounded-full border border-brand-500/30 bg-brand-500/10 px-2.5 py-0.5 text-xs font-medium text-brand-300 sm:inline-flex">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-brand-400" />
            Expo Mart &apos;26
          </span>
        </div>

        {/* Navigation Links (Desktop) */}
        <nav className="hidden items-center gap-6 md:flex">
          {siteConfig.navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-neutral-400 transition-colors hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action CTAs */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenInquiry}
            className="hidden items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-neutral-200 transition hover:bg-white/10 sm:inline-flex"
          >
            <MessageSquare className="h-3.5 w-3.5 text-brand-400" />
            <span>Discuss Project</span>
          </button>
          <Link
            href="/spin"
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3.5 text-xs font-semibold text-white shadow-md shadow-brand-500/20 transition hover:from-brand-500 hover:to-brand-400 active:scale-95"
          >
            <Sparkles className="h-3.5 w-3.5 animate-spin" />
            <span>Spin & Win</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
