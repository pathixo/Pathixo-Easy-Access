"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { useUtm } from "@/lib/hooks/useUtm";
import { Sparkles, CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

interface FormInputs {
  full_name: string;
  email: string;
  mobile: string;
  company?: string;
  designation?: string;
  interested_product?: string;
  message?: string;
  privacy_consent: boolean;
  marketing_consent?: boolean;
}

export function RegistrationForm() {
  const utm = useUtm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    defaultValues: {
      privacy_consent: false,
      marketing_consent: false,
    },
  });

  const onSubmit = async (values: FormInputs) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        ...values,
        turnstile_token: "1x00000000000000000000AA", // Local/official test token
        utm_source: utm.utm_source,
        utm_medium: utm.utm_medium,
        utm_campaign: utm.utm_campaign,
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
          setErrorMessage(
            data?.error?.message ||
              "This phone number or email is already registered. Please visit our stall counter if you need assistance."
          );
        } else {
          setErrorMessage(data?.error?.message || "Registration failed. Please check your details and retry.");
        }
        return;
      }

      setIsSuccess(true);
    } catch {
      setErrorMessage("Network connection error. Please verify your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="relative py-16 sm:py-24">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-[#121218] p-6 shadow-2xl sm:p-10">
          {!isSuccess ? (
            <div>
              {/* Header */}
              <div className="text-center">
                <div className="inline-flex items-center gap-1.5 rounded-full border border-brand-500/30 bg-brand-500/10 px-3 py-1 text-xs font-semibold text-brand-300">
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Exhibition Access & Lucky Draw</span>
                </div>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
                  Register Your Visit
                </h2>
                <p className="mt-2 text-xs text-neutral-400 sm:text-sm">
                  Complete registration to unlock your eligible Spin & Win turn and connect with our engineering team.
                </p>
              </div>

              {/* Form Errors Banner */}
              {errorMessage && (
                <div className="mt-6 flex items-start gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 p-3.5 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Fields */}
              <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Full Name <span className="text-brand-400">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Aarav Sharma"
                    {...register("full_name", {
                      required: "Full name is required",
                      minLength: { value: 2, message: "Name must be at least 2 characters" },
                    })}
                    className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  />
                  {errors.full_name && (
                    <p className="mt-1 text-[11px] text-red-400">{errors.full_name.message}</p>
                  )}
                </div>

                {/* Email & Mobile Grid */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300">
                      Work Email <span className="text-brand-400">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder="aarav@company.com"
                      {...register("email", {
                        required: "Email is required",
                        pattern: {
                          value: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
                          message: "Invalid email format",
                        },
                      })}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    {errors.email && (
                      <p className="mt-1 text-[11px] text-red-400">{errors.email.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300">
                      Mobile Number (+91) <span className="text-brand-400">*</span>
                    </label>
                    <input
                      type="tel"
                      placeholder="9876543210"
                      {...register("mobile", {
                        required: "10-digit mobile number is required",
                      })}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-[11px] text-red-400">{errors.mobile.message}</p>
                    )}
                  </div>
                </div>

                {/* Company & Designation */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300">Company Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      {...register("company")}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-neutral-300">Designation / Role</label>
                    <input
                      type="text"
                      placeholder="e.g. CTO / Product Manager"
                      {...register("designation")}
                      className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3.5 text-sm text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                    />
                  </div>
                </div>

                {/* Interested Product */}
                <div>
                  <label className="block text-xs font-medium text-neutral-300">
                    Primary Area of Interest
                  </label>
                  <select
                    {...register("interested_product")}
                    className="mt-1.5 h-11 w-full rounded-xl border border-white/10 bg-[#16161f] px-3.5 text-sm text-white focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                  >
                    <option value="all">General Exploration / All Offerings</option>
                    <option value="vakxo">Vakxo (AI Workspace Platform)</option>
                    <option value="crock-pdf">Crock PDF (Document Intelligence)</option>
                    <option value="custom-engineering">Custom Software & AI Development</option>
                  </select>
                </div>

                {/* Consent Checkboxes */}
                <div className="space-y-3 pt-3">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("privacy_consent", {
                        required: "You must accept the privacy policy to register.",
                      })}
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-neutral-400">
                      I agree to the{" "}
                      <Link href="/privacy" className="text-brand-400 underline hover:text-brand-300" target="_blank">
                        Privacy Policy
                      </Link>{" "}
                      and consent to Pathixo storing my registration for booth engagement and lucky draw participation.
                      <span className="text-brand-400">*</span>
                    </span>
                  </label>
                  {errors.privacy_consent && (
                    <p className="text-[11px] text-red-400">{errors.privacy_consent.message}</p>
                  )}

                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      {...register("marketing_consent")}
                      className="mt-0.5 h-4 w-4 rounded border-white/20 bg-white/10 text-brand-600 focus:ring-brand-500"
                    />
                    <span className="text-xs text-neutral-400">
                      (Optional) I agree to receive technical updates, product announcements, and follow-up communications from Pathixo.
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 active:scale-95 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Verifying & Registering...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Success State */
            <div className="py-6 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-2xl font-extrabold text-white">Registration Confirmed!</h3>
              <p className="mx-auto mt-2 max-w-md text-xs text-neutral-400 sm:text-sm">
                Your exhibition visitor profile has been securely saved. You are now authorized to participate in the Spin & Win Lucky Draw.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Link
                  href="/spin"
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-6 font-semibold text-white shadow-lg shadow-brand-500/30 transition hover:from-brand-500 hover:to-brand-400"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>Spin the Wheel & Claim Reward</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#products"
                  className="inline-flex h-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 px-6 font-medium text-neutral-300 transition hover:bg-white/10"
                >
                  Explore Products
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
