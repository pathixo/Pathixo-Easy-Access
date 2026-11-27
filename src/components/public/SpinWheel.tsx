"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Sparkles, Copy, Check, AlertCircle, Loader2, Gift, Lock, ArrowRight } from "lucide-react";
import { VisitorPassModal } from "./VisitorPassModal";

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
  { label: "15% Off Dev", slug: "discount-15-custom-dev", color: "#141619" },
  { label: "AI Consultation", slug: "free-ai-consultation", color: "#1c222b" },
  { label: "Special Pass", slug: "thank-you-pass", color: "#141619" },
  { label: "₹10K Credit", slug: "credit-10k-cloud", color: "#1c222b" },
  { label: "Tech Swag", slug: "exclusive-merchandise", color: "#141619" },
  { label: "Arch Review", slug: "free-ai-consultation", color: "#1c222b" },
  { label: "Booth Voucher", slug: "thank-you-pass", color: "#141619" },
  { label: "Cloud Credit", slug: "credit-10k-cloud", color: "#1c222b" },
];

export function SpinWheel() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registeredVisitorName, setRegisteredVisitorName] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<RewardData | null>(null);
  const [copied, setCopied] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  // 1. Check existing session and spin status on load
  useEffect(() => {
    async function checkExisting() {
      try {
        const res = await fetch("/api/spin/result");
        if (res.status === 401) {
          // Unregistered visitor - wheel remains visible in gated teaser mode
          setIsAuthenticated(false);
          return;
        }

        const json = await res.json();
        setIsAuthenticated(true);

        if (json.ok && json.data) {
          const d = json.data;
          setReward({
            spin_id: d.spin_id,
            reward_id: d.reward?.id,
            reward_name: d.reward?.name || "Exhibition Voucher",
            reward_slug: d.reward?.slug || "thank-you-pass",
            reward_type: d.reward?.reward_type || "no_prize",
            reward_description: d.reward?.description || "Thank you for visiting Pathixo at our booth!",
            reward_code: d.reward_code,
            expires_at: d.expires_at,
            redemption_instructions:
              d.reward?.redemption_instructions || "Show this code to our stall team.",
          });
        }
      } catch {
        // Fallback to allow gated interaction
      } finally {
        setLoadingInitial(false);
      }
    }
    checkExisting();
  }, []);

  // 2. Center Button Click Router
  const handleCenterButtonClick = () => {
    if (isSpinning || reward) return;

    if (!isAuthenticated) {
      // Trigger Lead Capture Modal first
      setIsModalOpen(true);
      return;
    }

    // Authenticated: Execute spin
    handleSpin();
  };

  // 3. Callback on Successful Registration from Modal
  const handleRegistrationSuccess = (visitorName: string) => {
    setIsAuthenticated(true);
    setRegisteredVisitorName(visitorName);
    setIsModalOpen(false);
  };

  // 4. Spin Handler
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
        setIsAuthenticated(false);
        setIsSpinning(false);
        setIsModalOpen(true);
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

      // 8 segments = 45 deg per segment
      const segmentAngle = 360 / SEGMENTS.length;
      const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
      const totalTurns = 5;
      const targetDegree = totalTurns * 360 + (360 - segmentCenter);

      setRotation(targetDegree);

      // 4.5s ease-out animation wait
      setTimeout(() => {
        setIsSpinning(false);
        setReward(outcome);
        sessionStorage.removeItem("px_spin_idempotency");

        // High-energy confetti burst
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#ccff00", "#ffffff", "#3b82f6", "#10b981"],
        });
      }, 4500);
    } catch {
      setErrorMessage("Network timeout while spinning. Tap Spin again to retry with your saved key.");
      setIsSpinning(false);
    }
  };

  const copyCode = () => {
    if (!reward?.reward_code) return;
    navigator.clipboard.writeText(reward.reward_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-md px-4 py-4 sm:px-6">
      {!reward ? (
        <div className="text-center">
          {/* Top Status Pill */}
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-3.5 py-1 font-mono text-[11px] font-bold text-[#ccff00] uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Guaranteed Prize For Registered Visitors</span>
          </div>

          <h1 className="mt-3 text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            SPIN & WIN <span className="text-[#ccff00]">LUCKY DRAW</span>
          </h1>

          <p className="mt-1 font-mono text-xs text-neutral-400">
            {isAuthenticated
              ? registeredVisitorName
                ? `Welcome, ${registeredVisitorName}! Tap the center to spin.`
                : "Your entry is verified! Tap the center to spin."
              : "Tap the center button to enter your details & unlock your spin."}
          </p>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SVG Wheel Container (300px, 100% responsive on 360px phones) */}
          <div className="relative mx-auto mt-7 flex h-[310px] w-[310px] items-center justify-center">
            {/* Top Pointer Indicator */}
            <div className="absolute -top-3.5 z-20 flex flex-col items-center">
              <div className="h-0 w-0 border-x-[10px] border-x-transparent border-t-[18px] border-t-[#ccff00] drop-shadow-[0px_4px_8px_rgba(204,255,0,0.5)]" />
            </div>

            {/* Rotating Wheel Body (Clickable to unlock or spin) */}
            <div
              ref={wheelRef}
              onClick={handleCenterButtonClick}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? "transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1.0)" : "none",
              }}
              className="h-[300px] w-[300px] rounded-full border-4 border-[#252a31] shadow-[0px_0px_30px_rgba(0,0,0,0.8)] relative overflow-hidden bg-[#0c0d0e] cursor-pointer"
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
                      <path d={pathData} fill={seg.color} stroke="#252a31" strokeWidth="0.6" />
                      {/* Segment Text */}
                      <text
                        x="50"
                        y="17"
                        fill="#f4f4f5"
                        fontSize="3.4"
                        fontWeight="bold"
                        fontFamily="monospace"
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

            {/* Center Hub / Dynamic Action Button */}
            <button
              onClick={handleCenterButtonClick}
              disabled={isSpinning}
              className={`absolute z-30 flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 transition active:scale-95 disabled:opacity-90 ${!isAuthenticated
                ? "border-[#ccff00] bg-[#0c0d0e] text-[#ccff00] shadow-[0px_0px_20px_rgba(204,255,0,0.4)] hover:scale-105"
                : "border-2 border-black bg-[#ccff00] text-black shadow-cyber hover:bg-[#d9ff33]"
                }`}
            >
              {isSpinning ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="font-mono text-[9px] font-black uppercase mt-0.5">SPINNING</span>
                </>
              ) : !isAuthenticated ? (
                <>
                  <Lock className="h-4 w-4 animate-pulse text-[#ccff00]" />
                  <span className="font-mono text-[9px] font-black uppercase tracking-wider mt-0.5">
                    UNLOCK
                  </span>
                  <span className="font-mono text-[7px] text-neutral-400 uppercase">1 TAP</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 stroke-[3]" />
                  <span className="font-mono text-[10px] font-black uppercase tracking-wider mt-0.5">
                    SPIN!
                  </span>
                </>
              )}
            </button>
          </div>

          {/* Prominent Action Button under Wheel for Guaranteed Touch Target */}
          <div className="mt-7">
            {!isAuthenticated ? (
              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-black bg-[#ccff00] font-mono text-sm sm:text-base font-black uppercase text-black shadow-cyber hover:bg-[#d9ff33] active:translate-y-0.5 transition"
              >
                <Lock className="h-4 w-4 stroke-[2.5]" />
                <span>UNLOCK LUCKY DRAW SPIN</span>
                <ArrowRight className="h-4 w-4 stroke-[3]" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSpin}
                disabled={isSpinning}
                className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-2 border-black bg-[#ccff00] font-mono text-sm sm:text-base font-black uppercase text-black shadow-cyber hover:bg-[#d9ff33] active:translate-y-0.5 transition disabled:opacity-60"
              >
                {isSpinning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>SPINNING THE WHEEL...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 stroke-[2.5]" />
                    <span>SPIN THE WHEEL NOW!</span>
                    <ArrowRight className="h-4 w-4 stroke-[3]" />
                  </>
                )}
              </button>
            )}
          </div>

          {/* Under-Wheel Explainer Banner */}
          <div className="mt-6 rounded-2xl border border-[#252a31] bg-[#141619] p-4 text-left font-mono text-xs text-neutral-300">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase text-[#ccff00] pb-2 border-b border-[#252a31]">
              <span>FAIR ALLOCATION GUARANTEE</span>
              <span>1 SPIN / VISITOR</span>
            </div>
            <p className="mt-2 text-neutral-400 leading-relaxed text-[11px]">
              {isAuthenticated
                ? "Your entry is active. Tap the center button above or 'SPIN THE WHEEL NOW!' to take your turn."
                : "Tap 'UNLOCK LUCKY DRAW SPIN' to fill your details once in 15 seconds. Your turn will be instantly unlocked."}
            </p>
          </div>
        </div>
      ) : (
        /* Reward Voucher Card */
        <div className="rounded-3xl border-2 border-[#ccff00] bg-[#121417] p-6 text-center shadow-[0px_0px_30px_rgba(204,255,0,0.15)] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00] shadow-[0px_0px_20px_rgba(204,255,0,0.3)]">
            <Gift className="h-7 w-7" />
          </div>

          <span className="mt-4 inline-block rounded-full border border-[#ccff00]/40 bg-[#ccff00]/10 px-3 py-1 font-mono text-[11px] font-bold text-[#ccff00] uppercase">
            PRIZE VERIFIED & ASSIGNED
          </span>

          <h2 className="mt-2 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            {reward.reward_name}
          </h2>

          <p className="mt-2 font-mono text-xs text-neutral-300 leading-relaxed">
            {reward.reward_description}
          </p>

          {/* Unique Voucher Code Display */}
          <div className="mt-6 rounded-2xl border-2 border-dashed border-[#ccff00]/60 bg-[#0c0d0e] p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
              YOUR STALL REDEMPTION CODE
            </span>
            <div className="mt-2 flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-black tracking-widest text-white sm:text-3xl">
                {reward.reward_code}
              </span>
              <button
                onClick={copyCode}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-neutral-700 bg-neutral-900 text-neutral-300 transition hover:border-[#ccff00] hover:text-[#ccff00] active:scale-95"
                title="Copy code"
              >
                {copied ? <Check className="h-4 w-4 text-[#ccff00]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && <p className="mt-1 font-mono text-[11px] text-[#ccff00]">Copied to clipboard!</p>}
          </div>

          {/* Redemption Instructions */}
          <div className="mt-5 rounded-xl border border-[#252a31] bg-[#141619] p-3.5 text-left font-mono text-xs text-neutral-300">
            <span className="font-bold text-[#ccff00] uppercase text-[10px]">Stall Redemption Instructions:</span>
            <p className="mt-1 leading-relaxed text-[11px] text-neutral-300">{reward.redemption_instructions}</p>
            <p className="mt-2 text-[10px] text-neutral-500">
              Valid until: {new Date(reward.expires_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="flex h-13 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#ccff00] font-mono text-xs font-black uppercase text-black shadow-cyber hover:bg-[#d9ff33] transition"
            >
              <span>RETURN TO PATHIXO PORTAL</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      )}

      {/* Exact 1:1 Visitor Pass Modal from Screenshot */}
      <VisitorPassModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRegisterSuccess={(name) => {
          setIsAuthenticated(true);
          setRegisteredVisitorName(name);
        }}
        targetDestination={{
          name: "Stall Lucky Draw",
          url: "/spin",
          category: "lucky-draw",
        }}
      />
    </div>
  );
}
