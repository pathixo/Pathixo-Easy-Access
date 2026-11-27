"use client";

import { useEffect, useState } from "react";
import { ArrowUpRight, CheckCircle2, Sparkles } from "lucide-react";

interface Product {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  description: string;
  key_features: string[];
  destination_url: string | null;
  badge_text: string | null;
  launch_status: string;
}

interface ProductShowcaseProps {
  onOpenInquiry: () => void;
}

export function ProductShowcase({ onOpenInquiry }: ProductShowcaseProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/products");
        const json = await res.json();
        if (json.ok && Array.isArray(json.data)) {
          setProducts(json.data);
        }
      } catch (e) {
        console.error("Failed to load products:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleCardClick = (slug: string) => {
    // Fire-and-forget telemetry event
    fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "product_card_click",
        product_slug: slug,
      }),
    }).catch(() => {});
  };

  return (
    <section id="products" className="py-16 sm:py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Pathixo Product Ecosystem</span>
          </div>
          <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-4xl">
            Engineered for Precision & Impact
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400 sm:text-base">
            Discover our proprietary AI platforms and custom engineering capabilities currently showcased at the exhibition.
          </p>
        </div>

        {/* Product Cards Grid */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {products.map((p) => {
            const isComingSoon = p.launch_status === "coming_soon";
            const hasUrl = Boolean(p.destination_url);

            return (
              <div
                key={p.id}
                onClick={() => handleCardClick(p.slug)}
                className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#121218] p-6 transition-all duration-200 hover:-translate-y-1 hover:border-brand-500/40 hover:shadow-xl hover:shadow-brand-500/5 sm:p-7"
              >
                <div>
                  {/* Badge & Name */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                      {p.slug}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        isComingSoon
                          ? "border border-amber-500/30 bg-amber-500/10 text-amber-300"
                          : "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                      }`}
                    >
                      {p.badge_text || (isComingSoon ? "Coming Soon" : "Available")}
                    </span>
                  </div>

                  <h3 className="mt-3 text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
                    {p.name}
                  </h3>
                  <p className="mt-1 text-xs font-medium text-brand-400">
                    {p.tagline}
                  </p>

                  <p className="mt-4 text-xs text-neutral-400 leading-relaxed sm:text-sm">
                    {p.description}
                  </p>

                  {/* Feature Bullets */}
                  <div className="mt-5 space-y-2 border-t border-white/10 pt-4">
                    {Array.isArray(p.key_features) &&
                      p.key_features.map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-neutral-300">
                          <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-400" />
                          <span>{feat}</span>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Card Action */}
                <div className="mt-7 pt-4">
                  {hasUrl ? (
                    <a
                      href={p.destination_url!}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-white/10 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
                    >
                      <span>Explore Product</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </a>
                  ) : isComingSoon ? (
                    <button
                      disabled
                      className="w-full cursor-not-allowed rounded-xl border border-white/10 bg-white/5 py-2.5 text-xs font-medium text-neutral-400"
                    >
                      In Private Beta • Coming Soon
                    </button>
                  ) : (
                    <button
                      onClick={onOpenInquiry}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl bg-brand-600 py-2.5 text-xs font-semibold text-white shadow-md shadow-brand-600/20 transition hover:bg-brand-500"
                    >
                      <span>Discuss Your Project</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
