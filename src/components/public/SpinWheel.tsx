"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Gift,
  ArrowRight,
  ShieldCheck,
  X,
} from "lucide-react";

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

interface FormInputs {
  full_name: string;
  mobile: string;
  email: string;
  interested_product?: string;
  privacy_consent: boolean;
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

function SpinRegistrationForm({ onRegistered }: { onRegistered: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      privacy_consent: true,
      interested_product: "all",
    },
  });

  const onSubmit = async (values: FormInputs) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...values,
        turnstile_token: "1x00000000000000000000AA",
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (res.status === 409 || data?.error?.code === "DUPLICATE_REGISTRATION") {
          // If returning visitor session was restored, continue to spin
          try {
            const checkSession = await fetch("/api/spin/result");
            if (checkSession.status !== 401) {
              onRegistered();
              return;
            }
          } catch {}

          setErrorMessage(
            data?.error?.message ||
              "This phone number or email is already registered. Please visit our stall team for assistance."
          );
          return;
        }

        setErrorMessage(data?.error?.message || "Registration failed. Please check your details.");
        return;
      }

      onRegistered();
    } catch {
      setErrorMessage("Network connection error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-[410px] rounded-3xl border-2 border-[#ccff00] bg-[#0c0d0e] p-4 sm:p-5 text-white shadow-[0px_0px_35px_rgba(204,255,0,0.2)]">
      {/* Header Badge */}
      <div className="flex items-center justify-between pb-2.5 border-b border-[#252a31]">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
          <span className="font-mono text-[10px] sm:text-[11px] font-semibold tracking-wider text-[#ccff00] uppercase">
            MEERUT TRADE SHOW • VISITOR CHECK-IN
          </span>
        </div>
        <Link
          href="/"
          className="flex h-6 w-6 items-center justify-center rounded-lg bg-neutral-800/80 text-neutral-400 hover:text-white transition"
          title="Back to Home"
        >
          <X className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="mt-2.5 mb-3 text-center sm:text-left">
        <h2 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white leading-tight">
          GET YOUR VISITOR PASS
        </h2>
        <p className="mt-1 font-mono text-[11px] text-neutral-400 leading-tight">
          Register once in 15 seconds to unlock direct access to our platforms, products, and stall lucky draw perks.
        </p>
      </div>

      {errorMessage && (
        <div className="mb-2.5 flex items-start gap-2 rounded-xl border border-red-500/40 bg-red-950/40 p-2.5 text-xs text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2.5">
        {/* Full Name */}
        <div>
          <label htmlFor="reg_full_name" className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase">
            Full Name <span className="text-[#ccff00]">*</span>
          </label>
          <input
            id="reg_full_name"
            type="text"
            placeholder="e.g. Rahul Sharma"
            {...register("full_name", {
              required: "Name is required",
              minLength: { value: 2, message: "Min 2 characters" },
            })}
            className="mt-1 h-9.5 w-full rounded-xl border border-[#252a31] bg-[#141619] px-3 font-sans text-sm text-white placeholder-neutral-500 focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
          />
          {errors.full_name && (
            <p className="mt-0.5 font-mono text-[10px] text-red-400">{errors.full_name.message}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label htmlFor="reg_mobile" className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase">
            Phone Number (10 digits) <span className="text-[#ccff00]">*</span>
          </label>
          <div className="relative mt-1 flex items-center">
            <span className="absolute left-3 font-mono text-xs text-neutral-400 font-semibold">
              +91
            </span>
            <input
              id="reg_mobile"
              type="tel"
              maxLength={10}
              placeholder="9876543210"
              {...register("mobile", {
                required: "Mobile is required",
                pattern: {
                  value: /^[6-9]\d{9}$/,
                  message: "Enter valid 10-digit Indian mobile",
                },
              })}
              className="h-9.5 w-full rounded-xl border border-[#252a31] bg-[#141619] pl-11 pr-3 font-mono text-sm text-white placeholder-neutral-500 focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
            />
          </div>
          {errors.mobile && (
            <p className="mt-0.5 font-mono text-[10px] text-red-400">{errors.mobile.message}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="reg_email" className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase">
            Email Address <span className="text-[#ccff00]">*</span>
          </label>
          <input
            id="reg_email"
            type="email"
            placeholder="rahul@example.com"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter valid email address",
              },
            })}
            className="mt-1 h-9.5 w-full rounded-xl border border-[#252a31] bg-[#141619] px-3 font-sans text-sm text-white placeholder-neutral-500 focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
          />
          {errors.email && (
            <p className="mt-0.5 font-mono text-[10px] text-red-400">{errors.email.message}</p>
          )}
        </div>

        {/* Primary Area of Interest */}
        <div>
          <label htmlFor="reg_interest" className="block font-mono text-[11px] font-semibold text-neutral-300 uppercase">
            Primary Area of Interest
          </label>
          <select
            id="reg_interest"
            {...register("interested_product")}
            className="mt-1 h-9.5 w-full rounded-xl border border-[#252a31] bg-[#141619] px-2.5 font-mono text-xs text-white focus:border-[#ccff00] focus:outline-none"
          >
            <option value="all">General Exploration / All Platforms</option>
            <option value="vakxo">Vakxo — Voice Autonomous Dev Agent</option>
            <option value="kroc-pdf">krocPDF — Pure & Private Document Suite</option>
            <option value="custom-dev">Custom Web / Mobile / Cloud Solutions</option>
          </select>
        </div>

        {/* DPDP Consent */}
        <div className="flex items-start gap-2 pt-0.5">
          <input
            id="reg_consent"
            type="checkbox"
            {...register("privacy_consent", { required: true })}
            defaultChecked
            className="mt-0.5 h-3.5 w-3.5 rounded border-neutral-700 bg-neutral-900 text-[#ccff00] accent-[#ccff00] focus:ring-0 shrink-0 cursor-pointer"
          />
          <label htmlFor="reg_consent" className="font-mono text-[9.5px] text-neutral-400 leading-tight cursor-pointer">
            I agree to receive event updates from Pathixo pursuant to DPDP Act 2023. View our{" "}
            <Link href="/privacy" target="_blank" className="text-[#ccff00] underline underline-offset-2">
              Privacy Policy
            </Link>
            .
          </label>
        </div>

        {/* Submit Action Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="relative flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-black bg-[#ccff00] font-mono text-xs sm:text-sm font-black uppercase text-black shadow-cyber hover:bg-[#d9ff33] active:translate-y-0.5 active:shadow-none transition disabled:opacity-50 mt-1"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>ACTIVATING TURN...</span>
            </>
          ) : (
            <>
              <span>CLAIM PASS & UNLOCK ALL ↗ →</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export function SpinWheel() {
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [unauthorized, setUnauthorized] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [rotation, setRotation] = useState(0);
  const [reward, setReward] = useState<RewardData | null>(null);
  const [copied, setCopied] = useState(false);
  const wheelRef = useRef<HTMLDivElement>(null);

  const checkExisting = useCallback(async () => {
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
      setUnauthorized(false);
    } catch {
      // Continue to allow spin attempt
    } finally {
      setLoadingInitial(false);
    }
  }, []);

  // 1. Check existing spin on mount
  useEffect(() => {
    checkExisting();
  }, [checkExisting]);

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
      const segmentCenter = targetIndex * segmentAngle + segmentAngle / 2;
      const totalTurns = 5; // 5 full rotations
      const targetDegree = totalTurns * 360 + (360 - segmentCenter);

      setRotation(targetDegree);

      // Wait for CSS animation to finish (4.5s)
      setTimeout(() => {
        setIsSpinning(false);
        setReward(outcome);
        sessionStorage.removeItem("px_spin_idempotency");

        // Confetti burst
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }, 4500);
    } catch {
      setErrorMessage("Network timeout while spinning. Please tap Spin again to retry.");
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
      <div className="flex flex-col items-center justify-center my-auto py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#ccff00]" />
        <p className="mt-3 font-mono text-xs text-neutral-400">Loading Lucky Draw status...</p>
      </div>
    );
  }

  // If user is not yet registered, show registration form right here on /spin!
  if (unauthorized) {
    return (
      <div className="w-full flex items-center justify-center my-auto">
        <SpinRegistrationForm
          onRegistered={() => {
            setUnauthorized(false);
            setLoadingInitial(true);
            checkExisting();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto my-auto px-2 sm:px-4 py-2 sm:py-4">
      {!reward ? (
        <div className="text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-[#ccff00]/30 bg-[#ccff00]/10 px-3 py-1 text-xs font-semibold text-[#ccff00]">
            <Sparkles className="h-3.5 w-3.5" />
            <span>One Guaranteed Reward Per Visitor</span>
          </div>

          <h1 className="mt-3 text-2xl font-black uppercase tracking-tight text-white sm:text-3xl">
            SPIN & WIN LUCKY DRAW
          </h1>
          <p className="mt-1 text-xs text-neutral-400">
            Tap the center button to spin. Outcome is cryptographically determined on our server.
          </p>

          {errorMessage && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* SVG Wheel Container */}
          <div className="relative mx-auto mt-8 flex h-[310px] w-[310px] items-center justify-center">
            {/* Pointer Marker (Top) */}
            <div className="absolute -top-3 z-20 flex flex-col items-center">
              <div className="h-0 w-0 border-x-8 border-x-transparent border-t-[16px] border-t-[#ccff00] drop-shadow-md" />
            </div>

            {/* Rotating Wheel Body */}
            <div
              ref={wheelRef}
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning ? "transform 4.5s cubic-bezier(0.15, 0.9, 0.25, 1.0)" : "none",
              }}
              className="h-[300px] w-[300px] rounded-full border-4 border-[#ccff00]/50 shadow-[0_0_30px_rgba(204,255,0,0.2)] relative overflow-hidden"
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
              className="absolute z-30 flex h-20 w-20 flex-col items-center justify-center rounded-full border-2 border-black bg-[#ccff00] text-black shadow-cyber transition active:scale-95 hover:bg-[#d9ff33] disabled:opacity-80"
            >
              <Sparkles className="h-5 w-5" />
              <span className="font-mono text-xs font-black uppercase tracking-wider">
                {isSpinning ? "..." : "SPIN"}
              </span>
            </button>
          </div>
        </div>
      ) : (
        /* Reward Voucher Card */
        <div className="rounded-3xl border-2 border-[#ccff00] bg-gradient-to-b from-[#161622] to-[#101016] p-6 text-center shadow-[0_0_35px_rgba(204,255,0,0.2)] sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#ccff00]/10 text-[#ccff00] border border-[#ccff00]/30">
            <Gift className="h-7 w-7" />
          </div>

          <span className="mt-3 inline-block rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-400">
            Reward Verified & Assigned
          </span>

          <h2 className="mt-3 text-xl font-black uppercase text-white sm:text-2xl">
            {reward.reward_name}
          </h2>

          <p className="mt-2 text-xs text-neutral-300 leading-relaxed sm:text-sm">
            {reward.reward_description}
          </p>

          {/* Unique Voucher Code Box */}
          <div className="mt-6 rounded-2xl border border-dashed border-[#ccff00]/40 bg-[#ccff00]/5 p-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#ccff00]">
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
                {copied ? <Check className="h-4 w-4 text-[#ccff00]" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            {copied && <p className="mt-1 text-[11px] text-[#ccff00]">Copied to clipboard!</p>}
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
              className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl border border-black bg-[#ccff00] font-mono font-bold text-xs uppercase text-black transition hover:bg-[#d9ff33]"
            >
              <span>Back to Pathixo Hub ↗</span>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
