"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Sparkles, Copy, Check, AlertCircle, ArrowLeft, Loader2, Gift } from "lucide-react";

interface RewardData {
  spin_id: string;
  reward_id: string;
  reward_name: string;
  reward_slug: string;
  reward_type: string;
  reward_description: string;
  reward_code: string;
  expires_at: string;
  redemption_instructions: string;
}

const SEGMENTS = [
  { label: "15% Off Dev", slug: "discount-15-custom-dev", color: "#0c87eb" },
  { label: "AI Consultation", slug: "free-ai-consultation", color: "#1e293b" },
  { label: "Thank You Pass", slug: "thank-you-pass", color: "#0284c7" },
  { label: "₹10K Credit", slug: "credit-10k-cloud", color: "#0f172a" },
  { label: "Tech Swag", slug: "exclusive-merchandise", color: "#2563eb" },
  { label: "Architecture Review", slug: "free-ai-consultation", color: "#1e293b" },
  { label: "Special Pass", slug: "thank-you-pass", color: "#0284c7" },
  { label: "Cloud Voucher", slug: "credit-10k-cloud", color: "#0f172a" },
];

export function SpinWheel() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<RewardData | null>(null);
  const [copied, setCopied] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  // 1. Check existing spin on mount
  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await fetch("/api/spin/result");
        if (res.status === 401) {
          setUnauthorized(true);
          return;
        }

        const json = await res.json();
        if (json.ok && json.data) {
          const d = json.data;
          setReward({
            spin_id: d.spin_id,
            reward_id: d.reward?.id,
            reward_name: d.reward?.name || "Exhibition Voucher",
            reward_slug: d.reward?.slug || "thank-you-pass",
            reward_type: d.reward?.reward_type || "no_prize",
            reward_description: d.reward?.description || "Thank you for visiting Pathixo at Expo Mart!",
            reward_code: d.reward_code,
            expires_at: d.expires_at,
            redemption_instructions:
              d.reward?.redemption_instructions || "Show this code to our stall team.",
          });
        }
      } catch {
        // Continue to allow spin attempt
      } finally {
        setLoadingInitial(false);
      }
    }
    checkExisting();
  }, []);

  // 2. Spin Handler
  const handleSpin = async () => {
    if (isSpinning || reward) return;

    setIsSpinning(true);
    setErrorMessage(null);

    // Retrieve or create session idempotency key
    let idempotencyKey = sessionStorage.getItem("px_spin_idempotency");
    if (!idempotencyKey) {
      idempotencyKey = `spin_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      sessionStorage.setItem("px_spin_idempotency", idempotencyKey);
    }

    try {
      const res = await fetch("/api/spin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
      });

      if (res.status === 401) {
        setUnauthorized(true);
        setIsSpinning(false);
        return;
      }

      const json = await res.json();
      if (!res.ok || !json.ok) {
        setErrorMessage(json?.error?.message || "Failed to complete spin. Please retry.");
        setIsSpinning(false);
        return;
      }

      const outcome = json.data as RewardData;

      // Find matching segment or default to index 2
      let targetIndex = SEGMENTS.findIndex((s) => s.slug === outcome.reward_slug);
      if (targetIndex === -1) targetIndex = 2;

      // Calculate target angle
      // 8 segments = 45 deg per segment. The pointer is at top (270 deg or 0 deg).
      const segmentAngle = 360 / SEGMENTS.length;
      // Center of target segment
      const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
      // To bring target segment to top pointer:
      const totalTurns = 5; // 5 full rotations
      const targetDegree = totalTurns * 360 + (360 - segmentCenter);

      setRotation(targetDegree);

      // Wait for CSS animation to finish (4.5s)
      setTimeout(() => {
        setIsSpinning(false);
        setReward(outcome);
        // Clear stored key on success
        sessionStorage.removeItem("px_spin_idempotency");

        // Confetti burst
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 4500);
    } catch {
      setErrorMessage("Network timeout while spinning. Please tap Spin again to retry with your saved key.");
      setIsSpinning(false);
    }
  };

  const copyCode = () => {
    if (!reward?.reward_code) return;
    navigator.clipboard.writeText(reward.reward_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingInitial) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-brand-400" />
        <p className="mt-3 text-xs text-neutral-400">Loading Lucky Draw status...</p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-md rounded-3xl border border-white/10 bg-[#121218] p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="mt-4 text-xl font-bold text-white">Registration Required</h2>
        <p className="mt-2 text-xs text-neutral-400 leading-relaxed">
          The Lucky Draw is exclusively available to verified exhibition attendees. Please register your visit to unlock your spin.
        </p>
        <Link
          href="/#register"
          className="mt-6 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-xs text-white transition hover:bg-brand-500"
        >
          <span>Register Now</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-8 sm:px-6">
      {!reward ? (
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
            <Sparkles className="h-3.5 w-3.5" />
            <span>One Guaranteed Reward Per Visitor</span>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Spin & Win Lucky Draw
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Tap the center button to spin. Your outcome is cryptographically generated on our server.
          </p>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SVG Wheel Container (fits 320px effortlessly on 360px screens) */}
          <div className="relative mx-auto mt-8 flex h-[310px] w-[310px] items-center justify-center">
            {/* Pointer Marker (Top) */}
            <div className="absolute -top-3 z-20 flex flex-col items-center">
              <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[16px] border-t-brand-400 drop-shadow-md" />
            </div>

            {/* Rotating Wheel Body */}
            <div
              ref={wheelRef}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? "transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1.0)" : "none",
              }}
              className="h-[300px] w-[300px] rounded-full border-4 border-white/20 shadow-2xl relative overflow-hidden"
            >
              <svg viewBox="0 0 100 100" className="h-full w-full">
                {SEGMENTS.map((seg, i) => {
                  const angle = 360 / SEGMENTS.length;
                  const startAngle = i * angle;
                  const endAngle = (i + 1) * angle;

                  const x1 = 50 + 50 * Math.cos((Math.PI * (startAngle - 90)) / 180);
                  const y1 = 50 + 50 * Math.sin((Math.PI * (startAngle - 90)) / 180);
                  const x2 = 50 + 50 * Math.cos((Math.PI * (endAngle - 90)) / 180);
                  const y2 = 50 + 50 * Math.sin((Math.PI * (endAngle - 90)) / 180);

                  const pathData = `M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`;

                  return (
                    <g key={i}>
                      <path d={pathData} fill={seg.color} stroke="#09090b" strokeWidth="0.5" />
                      {/* Segment Text */}
                      <text
                        x="50"
                        y="18"
                        fill="#f4f4f5"
                        fontSize="3.6"
                        fontWeight="bold"
                        textAnchor="middle"
                        transform={`rotate(${startAngle + angle / 2}, 50, 50)`}
                      >
                        {seg.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Center Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="absolute z-30 flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-white/30 bg-[#09090b] text-white shadow-xl transition active:scale-95 hover:border-brand-400 disabled:opacity-80"
            >
              <Sparkles className="h-4 w-4 text-brand-400" />
              <span className="text-[11px] font-extrabold uppercase tracking-wider">
                {isSpinning ? "..." : "SPIN"}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Reward Voucher Card */
        <div className="rounded-3xl border border-brand-500/30 bg-gradient-to-b from-[#161622] to-[#101016] p-6 text-center shadow-2xl sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Gift className="h-7 w-7" />
          </div>

          <span className="mt-3 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
            Reward Verified & Assigned
          </span>

          <h2 className="mt-3 text-xl font-extrabold text-white sm:text-2xl">
            {reward.reward_name}
          </h2>

          <p className="mt-2 text-xs text-neutral-300 leading-relaxed sm:text-sm">
            {reward.reward_description}
          </p>

          {/* Unique Voucher Code Box */}
          <div className="mt-6 rounded-2xl border border-dashed border-brand-500/40 bg-brand-950/20 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-brand-400">
              Your Exclusive Voucher Code
            </span>
            <div className="mt-1 flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-extrabold tracking-widest text-white sm:text-3xl">
                {reward.reward_code}
              </span>
              <button
                onClick={copyCode}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-neutral-300 transition hover:bg-white/20 active:scale-95"
                title="Copy code"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && <p className="mt-1 text-[11px] text-emerald-400">Copied to clipboard!</p>}
          </div>

          {/* Redemption Instructions */}
          <div className="mt-6 rounded-xl border border-white/5 bg-white/5 p-3.5 text-left text-xs text-neutral-400">
            <span className="font-semibold text-neutral-200">How to Redeem:</span>
            <p className="mt-1 leading-relaxed">{reward.redemption_instructions}</p>
            <p className="mt-2 text-[10px] text-neutral-500">
              Valid until: {new Date(reward.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2.5">
            <Link
              href="/"
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-brand-600 font-semibold text-xs text-white transition hover:bg-brand-500"
            >
              <span>Explore Products & Services</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
