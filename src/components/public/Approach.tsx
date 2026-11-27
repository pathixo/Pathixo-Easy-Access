import { Compass, GitMerge, ShieldCheck, Rocket } from "lucide-react";

const STEPS = [
  {
    step: "01",
    title: "Blueprint & Architecture",
    description: "We analyze technical constraints, define database schemas, and establish API contracts before writing a single line of code.",
    icon: Compass,
  },
  {
    step: "02",
    title: "Agile Production Sprints",
    description: "Milestone-driven vertical slices delivered incrementally. You see real working software every week, not abstract mockups.",
    icon: GitMerge,
  },
  {
    step: "03",
    title: "Security & Stress Testing",
    description: "Rigorous automated testing, zero-trust RLS policies, rate limiting, and concurrency checks under load.",
    icon: ShieldCheck,
  },
  {
    step: "04",
    title: "Deployment & Scaling",
    description: "Automated CI/CD pipelines to high-availability global edge infrastructure with live telemetry and health monitoring.",
    icon: Rocket,
  },
];

export function Approach() {
  return (
    <section id="approach" className="border-t border-white/10 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-brand-400">
            Methodology
          </h2>
          <p className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-4xl">
            How We Engineer Reliable Software
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400 sm:text-base">
            A disciplined, transparent engineering process that eliminates guesswork and delivers predictable results.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="relative rounded-2xl border border-white/10 bg-[#121218] p-6 transition hover:border-brand-500/30"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-brand-400">{s.step}</span>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 text-neutral-300">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>
                <h3 className="mt-4 text-base font-bold text-white">{s.title}</h3>
                <p className="mt-2 text-xs text-neutral-400 leading-relaxed">{s.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
