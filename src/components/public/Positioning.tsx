import { Box, Code2, Cpu } from "lucide-react";

export function Positioning() {
  return (
    <section className="border-y border-white/10 bg-[#0d0d12] py-14 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Company Positioning
          </h2>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Two Core Pillars of Engineering Excellence
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400 sm:text-base">
            Pathixo bridges proprietary product innovation with custom technology engineering for ambitious businesses.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {/* Pillar 1: Proprietary Products */}
          <div className="relative rounded-2xl border border-white/10 bg-[#121218] p-6 transition hover:border-brand-500/40 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Cpu className="h-6 w-6" />
            </div>
            <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-brand-400">
              Direction A
            </span>
            <h3 className="mt-1 text-xl font-bold text-white">
              Proprietary AI Product Development
            </h3>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              We independently conceptualize, architect, and engineer intelligent products designed to solve specific workflow bottlenecks, document processing challenges, and productivity tasks.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-300">
              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1">Vakxo AI Workspace</span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1">Crock PDF Intelligence</span>
            </div>
          </div>

          {/* Pillar 2: Custom Client Engineering */}
          <div className="relative rounded-2xl border border-white/10 bg-[#121218] p-6 transition hover:border-brand-500/40 sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
              <Code2 className="h-6 w-6" />
            </div>
            <span className="mt-4 inline-block text-xs font-semibold uppercase tracking-wider text-brand-400">
              Direction B
            </span>
            <h3 className="mt-1 text-xl font-bold text-white">
              Client-Centric Product Engineering
            </h3>
            <p className="mt-3 text-sm text-neutral-400 leading-relaxed">
              We partner with founders, businesses, and enterprise teams to transform concepts into production-ready platforms, custom SaaS systems, web applications, and resilient cloud architectures.
            </p>
            <div className="mt-6 flex flex-wrap gap-2 text-xs text-neutral-300">
              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1">Custom Web & SaaS</span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1">Mobile Apps</span>
              <span className="rounded-md border border-white/10 bg-white/5 px-2.5 py-1">AI Systems</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
