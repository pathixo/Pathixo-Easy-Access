"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useUtm } from "@/lib/hooks/useUtm";
import { X, Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight, ShieldCheck } from "lucide-react";

export interface VisitorPassModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegisterSuccess?: (name: string) => void;
  targetDestination?: {
    name: string;
    url: string;
    category?: string;
  };
}

interface FormInputs {
  full_name: string;
  email: string;
  mobile: string;
  interested_product?: string;
  privacy_consent: boolean;
}

export function VisitorPassModal({
  isOpen,
  onClose,
  onRegisterSuccess,
  targetDestination,
}: VisitorPassModalProps) {
  const utm = useUtm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredName, setRegisteredName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Always reset success and errors whenever modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsSuccess(false);
      setErrorMessage(null);
    }
  }, [isOpen]);

  const defaultProduct = targetDestination?.name?.toLowerCase().includes("vakxo")
    ? "vakxo"
    : targetDestination?.name?.toLowerCase().includes("kroc")
    ? "kroc-pdf"
    : "all";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      privacy_consent: true,
      interested_product: defaultProduct,
    },
  });

  const onSubmit = async (values: FormInputs) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...values,
        turnstile_token: "1x00000000000000000000AA", // Standard local/expo fallback token
        utm_source: utm.utm_source || "meerut_trade_show",
        utm_medium: utm.utm_medium || "qr_kiosk",
        utm_campaign: utm.utm_campaign || "expo_2026",
        utm_term: utm.utm_term,
        utm_content: utm.utm_content,
      };

      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (res.status === 409 || data?.error?.code === "DUPLICATE_REGISTRATION") {
          // Check if an existing valid session cookie is active
          try {
            const checkSession = await fetch("/api/spin/result");
            if (checkSession.status !== 401) {
              const name = values.full_name || "Valued Visitor";
              setRegisteredName(name);
              setIsSuccess(true);
              try {
                localStorage.setItem("px_visitor_registered", "true");
                localStorage.setItem("px_visitor_name", name);
              } catch {}
              onRegisterSuccess?.(name);
              return;
            }
          } catch {}

          setErrorMessage(
            data?.error?.message ||
              "This phone number or email is already registered. Please visit our stall team for lucky draw assistance."
          );
          return;
        }

        setErrorMessage(data?.error?.message || "Registration failed. Please check your details.");
        return;
      }

      const name = data?.data?.visitor_name || values.full_name;
      setRegisteredName(name);
      setIsSuccess(true);
      try {
        localStorage.setItem("px_visitor_registered", "true");
        localStorage.setItem("px_visitor_name", name);
      } catch {}
      onRegisterSuccess?.(name);

      if (targetDestination?.url === "/spin") {
        if (typeof window !== "undefined" && window.location.pathname !== "/spin") {
          setTimeout(() => {
            window.location.href = "/spin";
          }, 400);
        }
      }
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    if (targetDestination?.url) {
      window.open(targetDestination.url, "_blank", "noopener,noreferrer");
    }
    setIsSuccess(false);
    onClose();
  };

  const handleDismiss = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    reset();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          {/* Backdrop with ambient blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleDismiss}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
          />

          {/* Modal / Cyber Sheet */}
          <motion.div
            initial={{ opacity: 0, y: 60, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 60, scale: 0.96 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-lg rounded-t-3xl sm:rounded-2xl border-2 border-[#ccff00] bg-[#0c0d0e] p-6 text-white shadow-[0px_0px_35px_rgba(204,255,0,0.2)] z-10 max-h-[92vh] overflow-y-auto"
          >
            {/* Header Badge */}
            <div className="flex items-center justify-between pb-3 border-b border-[#252a31]">
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-[#ccff00] animate-pulse" />
                <span className="font-mono text-[11px] font-semibold tracking-wider text-[#ccff00] uppercase">
                  MEERUT TRADE SHOW • VISITOR CHECK-IN
                </span>
              </div>
              <button
                type="button"
                onClick={handleDismiss}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-900 text-neutral-400 hover:text-white hover:border-[#ccff00] transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {!isSuccess ? (
              <div className="mt-4">
                <div className="mb-5 text-center sm:text-left">
                  <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight text-white">
                    GET YOUR VISITOR PASS
                  </h3>
                  <p className="mt-1 font-mono text-xs text-neutral-400">
                    Register once in 15 seconds to unlock direct access to our platforms, products, and stall lucky draw perks.
                  </p>
                </div>

                {errorMessage && (
                  <div className="mb-4 flex items-start gap-2.5 rounded-xl border border-red-500/40 bg-red-950/40 p-3 text-xs text-red-300">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Full Name */}
                  <div>
                    <label className="block font-mono text-xs font-semibold text-neutral-300 uppercase">
                      Full Name <span className="text-[#ccff00]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      {...register("full_name", {
                        required: "Name is required",
                        minLength: { value: 2, message: "Min 2 characters" },
                      })}
                      className="mt-1 h-12 w-full rounded-xl border border-[#252a31] bg-[#141619] px-4 font-sans text-sm text-white placeholder-neutral-500 focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
                    />
                    {errors.full_name && (
                      <p className="mt-1 font-mono text-[11px] text-red-400">
                        {errors.full_name.message}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label className="block font-mono text-xs font-semibold text-neutral-300 uppercase">
                      Phone Number (10 digits) <span className="text-[#ccff00]">*</span>
                    </label>
                    <div className="relative mt-1 flex items-center">
                      <span className="absolute left-3.5 font-mono text-xs text-neutral-400 font-semibold">
                        +91
                      </span>
                      <input
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
                        className="h-12 w-full rounded-xl border border-[#252a31] bg-[#141619] pl-12 pr-4 font-mono text-sm text-white placeholder-neutral-500 focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
                      />
                    </div>
                    {errors.mobile && (
                      <p className="mt-1 font-mono text-[11px] text-red-400">
                        {errors.mobile.message}
                      </p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block font-mono text-xs font-semibold text-neutral-300 uppercase">
                      Email Address <span className="text-[#ccff00]">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="rahul@example.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Enter valid email address",
                        },
                      })}
                      className="mt-1 h-12 w-full rounded-xl border border-[#252a31] bg-[#141619] px-4 font-sans text-sm text-white placeholder-neutral-500 focus:border-[#ccff00] focus:outline-none focus:ring-1 focus:ring-[#ccff00]"
                    />
                    {errors.email && (
                      <p className="mt-1 font-mono text-[11px] text-red-400">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Primary Area of Interest */}
                  <div>
                    <label className="block font-mono text-xs font-semibold text-neutral-300 uppercase">
                      Primary Area of Interest
                    </label>
                    <select
                      {...register("interested_product")}
                      className="mt-1 h-12 w-full rounded-xl border border-[#252a31] bg-[#141619] px-3 font-mono text-xs text-white focus:border-[#ccff00] focus:outline-none"
                    >
                      <option value="all">General Exploration / All Platforms</option>
                      <option value="vakxo">Vakxo — Autonomous Voice Dev Agent</option>
                      <option value="kroc-pdf">krocPDF — Enterprise Document AI</option>
                      <option value="custom-dev">Custom Web / Mobile / Cloud Solutions</option>
                    </select>
                  </div>

                  {/* DPDP Consent */}
                  <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                    <input
                      type="checkbox"
                      {...register("privacy_consent", { required: true })}
                      defaultChecked
                      className="mt-0.5 h-4 w-4 rounded border-neutral-700 bg-neutral-900 text-[#ccff00] accent-[#ccff00] focus:ring-0"
                    />
                    <span className="font-mono text-[11px] text-neutral-400 leading-tight">
                      I agree to receive event updates from Pathixo pursuant to DPDP Act 2023. View our{" "}
                      <Link
                        href="/privacy"
                        target="_blank"
                        className="text-[#ccff00] underline underline-offset-2"
                      >
                        Privacy Policy
                      </Link>
                      .
                    </span>
                  </label>

                  {/* Big Cyber Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="relative flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#ccff00] font-mono text-sm font-black uppercase text-black shadow-cyber hover:bg-[#d9ff33] active:translate-y-0.5 active:shadow-none transition disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>ISSUING PASS...</span>
                      </>
                    ) : (
                      <>
                        <span>CLAIM PASS & UNLOCK ALL ↗</span>
                        <ArrowRight className="h-4 w-4 stroke-[3]" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Success / Pass Issued Screen */
              <div className="py-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#ccff00] bg-[#ccff00]/10 text-[#ccff00] shadow-[0px_0px_20px_rgba(204,255,0,0.3)]">
                  <CheckCircle2 className="h-7 w-7" />
                </div>

                <div className="mt-4">
                  <span className="inline-block rounded-full bg-[#ccff00]/10 border border-[#ccff00]/30 px-3 py-1 font-mono text-[11px] font-bold text-[#ccff00] uppercase">
                    VISITOR PASS VERIFIED
                  </span>
                  <h3 className="mt-2 text-2xl font-black uppercase tracking-tight text-white">
                    WELCOME, {registeredName}!
                  </h3>
                  <p className="mt-1 font-mono text-xs text-neutral-400">
                    All Pathixo platforms and stall privileges are now unlocked for you.
                  </p>
                </div>

                {/* Primary Destination Action */}
                <div className="mt-6 space-y-3">
                  {targetDestination?.url === "/spin" ? (
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuccess(false);
                        onClose();
                      }}
                      className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#ccff00] font-mono text-sm font-black uppercase text-black shadow-cyber hover:bg-[#d9ff33] active:translate-y-0.5 active:shadow-none transition"
                    >
                      <Sparkles className="h-5 w-5 stroke-[2.5]" />
                      <span>SPIN THE WHEEL NOW ↗</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleFinish}
                        className="flex h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-[#ccff00] font-mono text-sm font-black uppercase text-black shadow-cyber hover:bg-[#d9ff33] active:translate-y-0.5 active:shadow-none transition"
                      >
                        <ShieldCheck className="h-5 w-5 stroke-[2.5]" />
                        <span>EXPLORE {targetDestination?.name ? targetDestination.name.toUpperCase() : "PATHIXO HUB"} ↗</span>
                      </button>

                      {/* Lucky Draw Turn Button */}
                      <Link
                        href="/spin"
                        onClick={onClose}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-[#252a31] bg-[#141619] font-mono text-xs font-bold uppercase text-[#ccff00] hover:border-[#ccff00] transition"
                      >
                        <Sparkles className="h-4 w-4" />
                        <span>PLAY STALL LUCKY DRAW (SPIN & WIN)</span>
                      </Link>
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
