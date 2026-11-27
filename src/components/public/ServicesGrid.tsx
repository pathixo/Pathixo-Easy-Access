"use client";

import { siteConfig } from "@/config/site";
import { Globe, Smartphone, Sparkles, Cloud, Server, ArrowRight } from "lucide-react";

interface ServicesGridProps {
  onOpenInquiry: () => void;
}

const ICONS = {
  Globe,
  Smartphone,
  Sparkles,
  Cloud,
  Server,
};

export function ServicesGrid({ onOpenInquiry }: ServicesGridProps) {
  return (
    <section id="services" className="border-t border-white/10 bg-[#0d0d12] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Our Engineering Capabilities
          </h2>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Custom Product & Software Development
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400 sm:text-base">
            From modern responsive web platforms to intelligent backend pipelines, we engineer software tailored to your commercial requirements.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {siteConfig.services.map((s) => {
            const IconComponent = ICONS[s.icon as keyof typeof ICONS] || Globe;
            return (
              <div
                key={s.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121218] p-6 transition hover:border-brand-500/40"
              >
                <div>
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-brand-500/20 bg-brand-500/10 text-brand-400">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-white group-hover:text-brand-300 transition-colors">
                    {s.title}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-brand-400">
                    {s.tagline}
                  </p>
                  <p className="mt-2.5 text-xs text-neutral-400 leading-relaxed sm:text-sm">
                    {s.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-white/5">
                  <button
                    onClick={onOpenInquiry}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-brand-400 transition hover:text-brand-300"
                  >
                    <span>Request Details</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </div>
            );
          })}

          {/* Call to action card */}
          <div className="flex flex-col justify-center rounded-2xl border border-brand-500/30 bg-gradient-to-br from-brand-950/40 to-brand-900/10 p-6 text-center sm:p-8">
            <h3 className="text-xl font-bold text-white">Have a Unique Challenge?</h3>
            <p className="mt-2 text-xs text-neutral-300 sm:text-sm">
              Speak directly with our technical leadership at the booth to map out your architecture.
            </p>
            <button
              onClick={onOpenInquiry}
              className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-brand-600 px-5 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-500"
            >
              Start Project Discussion
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
