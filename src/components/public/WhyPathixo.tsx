import { siteConfig } from "@/config/site";
import { CheckCircle } from "lucide-react";

export function WhyPathixo() {
  return (
    <section id="why-pathixo" className="border-t border-white/10 bg-[#0d0d12] py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Why Pathixo
          </h2>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            Built for Businesses That Value Quality
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400 sm:text-base">
            We operate as an extension of your product team with strict engineering standards and clear deliverables.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {siteConfig.whyUs.map((item, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 rounded-2xl border border-white/10 bg-[#121218] p-6 transition hover:border-brand-500/30"
            >
              <div className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-500/10 text-brand-400">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{item.title}</h3>
                <p className="mt-1.5 text-xs text-neutral-400 leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
