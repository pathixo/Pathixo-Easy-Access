"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { X, Send, CheckCircle2, Loader2, AlertCircle } from "lucide-react";

interface InquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InquiryInputs {
  full_name: string;
  email: string;
  mobile: string;
  company?: string;
  service_needed?: string;
  project_description: string;
  estimated_budget?: string;
}

export function InquiryModal({ isOpen, onClose }: InquiryModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InquiryInputs>();

  if (!isOpen) return null;

  const onSubmit = async (values: InquiryInputs) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          turnstile_token: "1x00000000000000000000AA",
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setErrorMessage(data?.error?.message || "Submission failed. Please try again.");
        return;
      }

      setIsSuccess(true);
      reset();
    } catch {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsSuccess(false);
    setErrorMessage(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-0 sm:items-center sm:p-4">
      <div className="w-full max-w-lg rounded-t-3xl sm:rounded-3xl border border-white/10 bg-[#121218] p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h3 className="text-lg font-bold text-white">Discuss Your Project</h3>
          <button
            onClick={handleClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-neutral-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {!isSuccess ? (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-5 space-y-3.5 max-h-[75vh] overflow-y-auto pr-1">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-neutral-300">
                Your Name <span className="text-brand-400">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Vikram Verma"
                {...register("full_name", { required: "Name is required" })}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
              />
              {errors.full_name && <p className="mt-1 text-[10px] text-red-400">{errors.full_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  Work Email <span className="text-brand-400">*</span>
                </label>
                <input
                  type="email"
                  placeholder="vikram@corp.com"
                  {...register("email", { required: "Email is required" })}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300">
                  Phone (+91) <span className="text-brand-400">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  {...register("mobile", { required: "Mobile is required" })}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-300">Company</label>
                <input
                  type="text"
                  placeholder="Company name"
                  {...register("company")}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-xs text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-300">Service Category</label>
                <select
                  {...register("service_needed")}
                  className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#181822] px-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
                >
                  <option value="Web Development">Web Platform Engineering</option>
                  <option value="Mobile Development">Mobile Application</option>
                  <option value="AI Solutions">AI & LLM Integration</option>
                  <option value="Cloud Solutions">Cloud & DevOps</option>
                  <option value="API Backend">Backend / Microservices</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300">
                Project Overview <span className="text-brand-400">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Briefly describe what you're looking to build or your technical challenge..."
                {...register("project_description", {
                  required: "Description is required",
                  minLength: { value: 10, message: "Please provide at least 10 characters" },
                })}
                className="mt-1 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-white placeholder-neutral-500 focus:border-brand-500 focus:outline-none"
              />
              {errors.project_description && (
                <p className="mt-1 text-[10px] text-red-400">{errors.project_description.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-300">Estimated Budget</label>
              <select
                {...register("estimated_budget")}
                className="mt-1 h-10 w-full rounded-xl border border-white/10 bg-[#181822] px-2.5 text-xs text-white focus:border-brand-500 focus:outline-none"
              >
                <option value="Under ₹1,00,000">Under ₹1,00,000</option>
                <option value="₹1,00,000 - ₹3,00,000">₹1,00,000 - ₹3,00,000</option>
                <option value="₹3,00,000 - ₹10,00,000">₹3,00,000 - ₹10,00,000</option>
                <option value="Above ₹10,00,000">Above ₹10,00,000</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-brand-600 font-semibold text-xs text-white transition hover:bg-brand-500 active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  <span>Send Project Inquiry</span>
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="py-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="mt-3 text-base font-bold text-white">Inquiry Received</h4>
            <p className="mt-1.5 text-xs text-neutral-400">
              Thank you for sharing your project details. Our engineering leadership will follow up promptly.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 inline-flex h-9 items-center justify-center rounded-xl bg-white/10 px-5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
