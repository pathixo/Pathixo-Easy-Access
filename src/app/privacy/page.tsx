import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArrowLeft, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Privacy Policy — Pathixo Expo Platform",
  description: "Privacy policy and data protection practices for Pathixo Private Limited exhibition platform.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#09090b] text-[#f4f4f5]">
      {/* Top Navigation */}
      <div className="border-b border-white/10 bg-[#09090b]/80 backdrop-blur-md px-4 py-3 sm:px-6">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Home</span>
          </Link>
          <span className="text-xs font-mono text-brand-400">LEGAL & PRIVACY</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Privacy Policy</h1>
            <p className="text-xs text-neutral-400">Last updated: January 2026 • DPDP Act & GDPR Aligned</p>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-white">1. Introduction</h2>
            <p className="mt-2">
              {siteConfig.company.legalName} (&quot;Pathixo&quot;, &quot;we&quot;, &quot;us&quot;) operates this digital platform for the {siteConfig.expo.eventName} at {siteConfig.expo.venue}. We are committed to safeguarding your personal data in compliance with applicable data protection laws, including the Digital Personal Data Protection (DPDP) Act, 2023 of India.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">2. Information We Collect</h2>
            <p className="mt-2">When you register at our stall or submit an inquiry, we collect:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-neutral-400">
              <li><strong>Identity & Contact Information:</strong> Full Name, Email Address, and 10-digit Indian Mobile Number.</li>
              <li><strong>Professional Details:</strong> Company Name, Designation, and Selected Product/Service Interests.</li>
              <li><strong>Consent Timestamps:</strong> UTC timestamp of explicit consent acceptance.</li>
              <li><strong>Exhibition Context:</strong> Campaign parameters (UTM tags) and booth registration source.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">3. Purpose of Processing</h2>
            <p className="mt-2">Your information is used exclusively to:</p>
            <ul className="mt-2 list-disc pl-5 space-y-1 text-neutral-400">
              <li>Authenticate your eligibility for the one-time exhibition Spin & Win Lucky Draw.</li>
              <li>Generate and verify unique voucher redemption codes at our exhibition stall.</li>
              <li>Respond to bespoke software, AI development, or partnership inquiries submitted by you.</li>
              <li>Provide direct follow-up communications where marketing consent was voluntarily given.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">4. Zero Client Direct Access & Security</h2>
            <p className="mt-2">
              We employ strict zero-trust security controls. The public web browser never queries the database directly. All database access is governed by server-side code using strict Row-Level Security (RLS) with privileges revoked from public clients. Session identification relies on signed, encrypted HttpOnly cookies to prevent token theft or URL manipulation.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">5. Third-Party Sharing</h2>
            <p className="mt-2">
              Pathixo does not sell, rent, or trade your personal information to third parties. Data is hosted securely on enterprise cloud infrastructure (Supabase/AWS) located in secure regional data centers.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">6. Your Data Rights</h2>
            <p className="mt-2">
              You possess the right to request access to your recorded data, seek corrections, or demand the deletion of your visitor profile from our systems following the exhibition.
            </p>
            <p className="mt-3">
              To exercise these rights, please contact our data grievance officer at:
              <br />
              <strong className="text-white">Email:</strong>{" "}
              <a href={`mailto:${siteConfig.company.email}`} className="text-brand-400 underline">
                {siteConfig.company.email}
              </a>
              <br />
              <strong className="text-white">Phone:</strong> {siteConfig.company.displayPhone}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
