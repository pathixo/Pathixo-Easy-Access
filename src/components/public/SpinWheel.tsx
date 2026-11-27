"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import { Sparkles, Copy, Check, AlertCircle, Loader2, Gift, Volume2, VolumeX, MailCheck, ArrowRight } from "lucide-react";

interface RewardData {
  spin_id: string;
  reward_id: string;
  reward_name: string;
  display_label?: string;
  reward_slug: string;
  reward_type: string;
  reward_description: string;
  reward_code: string;
  expires_at: string;
  redemption_instructions: string;
  email_status?: string;
}

// 8 Cyber-Gamified Segments matching Trade Show DB Rewards
const SEGMENTS = [
  { label: "1-Yr Vakxo Pro", slug: "vakxo-1-year", color: "#ccff00", text: "#0a0b0c" },
  { label: "20% Off Dev", slug: "discount-20-dev", color: "#16191d", text: "#f4f4f5" },
  { label: "Booth Swag", slug: "booth-tech-swag", color: "#ccff00", text: "#0a0b0c" },
  { label: "1-Mo Vakxo Pro", slug: "vakxo-1-month", color: "#101214", text: "#ccff00" },
  { label: "AI Strategy Call", slug: "ai-strategy-call", color: "#16191d", text: "#f4f4f5" },
  { label: "50% Off Cloud", slug: "discount-50-cloud", color: "#101214", text: "#ccff00" },
  { label: "3-Mo krocPDF", slug: "extended-trial-3mo", color: "#16191d", text: "#f4f4f5" },
  { label: "VIP Expo Pass", slug: "vip-expo-pass", color: "#101214", text: "#a1a1aa" },
];

export function SpinWheel() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<RewardData | null>(null);
  const [copied, setCopied] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const tickIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("px_wheel_muted");
    if (saved === "true") setIsMuted(true);
  }, []);

  const toggleSound = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem("px_wheel_muted", String(next));
      return next;
    });
  };

  const getAudioContext = () => {
    if (!audioCtxRef.current && typeof window !== "undefined") {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTickSound = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(850, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.04);
    } catch {
      // Safe ignore
    }
  };

  const playVictoryChime = () => {
    if (isMuted) return;
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.12, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
      });
    } catch {
      // Safe ignore
    }
  };

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
            reward_name: d.reward?.name || "Trade Show Voucher",
            display_label: d.reward?.display_label || d.reward?.name,
            reward_slug: d.reward?.slug || "vip-expo-pass",
            reward_type: d.reward?.reward_type || "no_prize",
            reward_description: d.reward?.description || "Thank you for visiting Pathixo!",
            reward_code: d.reward_code,
            expires_at: d.expires_at,
            redemption_instructions:
              d.reward?.redemption_instructions || "Show this code at our booth counter.",
            email_status: d.email_status,
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

  const handleSpin = async () => {
    if (isSpinning || reward) return;

    setIsSpinning(true);
    setErrorMessage(null);

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

      let targetIndex = SEGMENTS.findIndex((s) => s.slug === outcome.reward_slug);
      if (targetIndex === -1) targetIndex = 7;

      const segmentAngle = 360 / SEGMENTS.length;
      const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
      const totalTurns = 5;
      const targetDegree = totalTurns * 360 + (360 - segmentCenter);

      setRotation(targetDegree);

      let tickCount = 0;
      const totalTicks = 35;
      const tick = () => {
        playTickSound();
        tickCount++;
        if (tickCount < totalTicks) {
          const delay = 60 + Math.pow(tickCount / totalTicks, 2) * 200;
          tickIntervalRef.current = setTimeout(tick, delay);
        }
      };
      tick();

      setTimeout(() => {
        if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
        playVictoryChime();

        confetti({
          particleCount: 130,
          spread: 80,
          origin: { y: 0.55 },
          colors: ["#ccff00", "#ffffff", "#38bdf8"],
        });

        setTimeout(() => {
          setIsSpinning(false);
          setReward(outcome);
          sessionStorage.removeItem("px_spin_idempotency");
        }, 900);
      }, 4500);
    } catch {
      if (tickIntervalRef.current) clearTimeout(tickIntervalRef.current);
      setErrorMessage("Network timeout while spinning. Tap Spin again to retry.");
      setIsSpinning(false);
    }
  };

  const copyCode = async () => {
    if (!reward?.reward_code) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(reward.reward_code);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = reward.reward_code;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Safe fallback
    }
  };

  if (loadingInitial) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#ccff00]" />
        <p className="mt-3 font-mono text-xs text-neutral-400 uppercase tracking-wider">
          {"// VERIFYING ACCESS PASS..."}
        </p>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-2xl border-2 border-white/10 bg-[#101214] p-7 text-center shadow-cyber">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-[#ccff00]/30 bg-[#ccff00]/10 text-[#ccff00]">
            <AlertCircle className="h-7 w-7" />
          </div>
          <span className="mt-4 inline-block font-mono text-[10px] font-bold uppercase tracking-widest text-[#ccff00]">
            {"// ACCESS PASS REQUIRED"}
          </span>
          <h2 className="mt-1 text-xl font-black uppercase tracking-tight text-white">
            Register to Unlock Spin
          </h2>
          <p className="mt-2 font-mono text-xs text-neutral-400 leading-relaxed">
            Claim your Digital Visitor Pass on the home portal first to unlock your guaranteed Lucky Draw turn.
          </p>
          <Link
            href="/"
            className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#ccff00] font-mono text-sm font-black uppercase text-black shadow-cyber hover:bg-[#d9ff33] active:translate-y-0.5 active:shadow-none transition"
          >
            <span>CLAIM VISITOR PASS</span>
            <ArrowRight className="h-4 w-4 stroke-[3]" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-2 sm:px-6">
      {!reward ? (
        <div className="text-center">
          {/* Sound Toggle Bar */}
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-neutral-400">
              {"// 1 GUARANTEED PRIZE"}
            </span>
            <button
              onClick={toggleSound}
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-white/10 bg-[#141619] px-2.5 font-mono text-[11px] text-neutral-300 hover:border-[#ccff00]/50 transition"
            >
              {isMuted ? (
                <>
                  <VolumeX className="h-3.5 w-3.5 text-neutral-500" />
                  <span className="text-neutral-500">MUTED</span>
                </>
              ) : (
                <>
                  <Volume2 className="h-3.5 w-3.5 text-[#ccff00]" />
                  <span className="text-[#ccff00]">SFX ON</span>
                </>
              )}
            </button>
          </div>

          <h1 className="text-3xl font-black uppercase tracking-tight text-white sm:text-4xl">
            SPIN & WIN <span className="text-[#ccff00]">REWARDS</span>
          </h1>
          <p className="mt-1.5 font-mono text-xs text-neutral-400">
            Tap the center button to spin. Cryptographically verified on our server.
          </p>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 font-mono text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Cyber Lime & Stealth Carbon Wheel Container */}
          <div className="relative mx-auto mt-7 flex h-[310px] w-[310px] items-center justify-center select-none">
            {/* Top Cyber Lime Pointer */}
            <div className="absolute -top-3.5 z-20 flex flex-col items-center">
              <div className="h-0 w-0 border-x-[10px] border-x-transparent border-t-[20px] border-t-[#ccff00] drop-shadow-[0_2px_8px_rgba(204,255,0,0.6)]" />
            </div>

            {/* Rotating Wheel Body */}
            <div
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? "transform 4.5s cubic-bezier(0.12, 0.95, 0.22, 1.0)" : "none",
                willChange: "transform",
              }}
              className="h-[300px] w-[300px] rounded-full border-4 border-[#ccff00]/60 shadow-[0_0_30px_rgba(204,255,0,0.12)] relative overflow-hidden bg-[#101214]"
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
                      <path d={pathData} fill={seg.color} stroke="#0a0b0c" strokeWidth="0.7" />
                      <text
                        x="50"
                        y="17"
                        fill={seg.text}
                        fontSize="3.4"
                        fontWeight="800"
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

            {/* Center Tactile Cyber Lime Spin Button */}
            <button
              onClick={handleSpin}
              disabled={isSpinning}
              className="absolute z-30 flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-black bg-[#ccff00] text-black shadow-cyber transition active:scale-95 hover:bg-[#d9ff33] disabled:opacity-80"
            >
              <Sparkles className="h-4 w-4 text-black stroke-[2.5]" />
              <span className="font-mono text-xs font-black uppercase tracking-wider">
                {isSpinning ? "..." : "SPIN"}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Cyber Voucher Reward Card */
        <div className="rounded-2xl border-2 border-[#ccff00]/40 bg-[#101214] p-6 text-center shadow-cyber sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border-2 border-black bg-[#ccff00] text-black shadow-cyber-sm">
            <Gift className="h-7 w-7 stroke-[2.5]" />
          </div>

          <span className="mt-4 inline-block rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-3 py-0.5 font-mono text-[11px] font-bold uppercase text-[#ccff00]">
            {"// REWARD ALLOCATED"}
          </span>

          <h2 className="mt-2.5 text-2xl font-black uppercase tracking-tight text-white">
            {reward.reward_name}
          </h2>

          <p className="mt-2 font-mono text-xs text-neutral-300 leading-relaxed">
            {reward.reward_description}
          </p>

          {/* Voucher Code Box */}
          <div className="mt-5 rounded-xl border-2 border-dashed border-[#ccff00]/50 bg-[#0a0b0c] p-4">
            <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              OFFICIAL VOUCHER CODE
            </span>
            <div className="mt-1.5 flex items-center justify-center gap-3">
              <span className="font-mono text-2xl font-black tracking-widest text-[#ccff00] sm:text-3xl">
                {reward.reward_code}
              </span>
              <button
                onClick={copyCode}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#16191d] text-neutral-300 hover:border-[#ccff00] hover:text-[#ccff00] active:scale-95 transition"
                title="Copy code"
              >
                {copied ? <Check className="h-4 w-4 text-[#ccff00]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && (
              <p className="mt-1.5 font-mono text-[11px] font-bold text-[#ccff00]">
                COPIED TO CLIPBOARD!
              </p>
            )}
          </div>

          {/* Email Confirmation Pill */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#141619] p-3 font-mono text-[11px] text-neutral-300">
            <MailCheck className="h-4 w-4 text-[#ccff00] shrink-0" />
            <span>Voucher details sent to your registered email.</span>
          </div>

          {/* Claim Instructions */}
          <div className="mt-4 rounded-xl border border-white/10 bg-[#141619] p-3.5 text-left font-mono text-xs text-neutral-400">
            <span className="font-bold text-white uppercase">How to Claim:</span>
            <p className="mt-1 leading-relaxed">{reward.redemption_instructions}</p>
            <p className="mt-2 text-[10px] text-neutral-500">
              Valid until:{" "}
              {new Date(reward.expires_at).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>

          <div className="mt-6">
            <Link
              href="/"
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#ccff00] font-mono text-sm font-black uppercase text-black shadow-cyber hover:bg-[#d9ff33] active:translate-y-0.5 active:shadow-none transition"
            >
              <span>BACK TO PATHIXO HUB</span>
              <ArrowRight className="h-4 w-4 stroke-[3]" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
