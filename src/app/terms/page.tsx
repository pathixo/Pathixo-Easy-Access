import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/config/site";
import { ArrowLeft, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "Terms & Lucky Draw Rules — Pathixo Expo Platform",
  description: "Terms and conditions for Pathixo Private Limited exhibition digital platform and Lucky Draw.",
};

export default function TermsPage() {
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
          <span className="text-xs font-mono text-brand-400">TERMS OF PARTICIPATION</span>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Terms & Lucky Draw Rules</h1>
            <p className="text-xs text-neutral-400">{siteConfig.company.legalName} • {siteConfig.expo.eventName}</p>
          </div>
        </div>

        <div className="mt-8 space-y-8 text-xs sm:text-sm text-neutral-300 leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-white">1. Agreement to Terms</h2>
            <p className="mt-2">
              By accessing the {siteConfig.company.brandName} digital exhibition application, registering as an attendee, or participating in the Spin & Win lucky draw, you agree to be bound by these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">2. Lucky Draw Rules & Integrity</h2>
            <ul className="mt-2 list-disc pl-5 space-y-2 text-neutral-400">
              <li>
                <strong>One Participation Per Attendee:</strong> Participation is strictly limited to one (1) spin per verified visitor, enforced by unique mobile number and signed cryptographic session.
              </li>
              <li>
                <strong>Server-Side Randomness:</strong> Outcomes are decided exclusively by an atomic PostgreSQL transaction on our secure server. The client wheel animation strictly reflects the verified server allocation.
              </li>
              <li>
                <strong>Idempotent Sessions:</strong> Network drops or duplicate taps will return the visitor&apos;s existing allocated voucher code and will not produce multiple spins.
              </li>
              <li>
                <strong>Voucher Code Format:</strong> Eligible outcomes yield an 8-character unique voucher code in the format <code>PX-XXXX-XXXX</code>.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">3. Redemption & Availability</h2>
            <ul className="mt-2 list-disc pl-5 space-y-2 text-neutral-400">
              <li>
                Prizes and promotional vouchers (including software discounts, cloud implementation credits, merchandise, and architectural consultations) are subject to stock availability and Pathixo management approval.
              </li>
              <li>
                Promotional vouchers have no cash liquidation value, are non-transferable, and cannot be traded.
              </li>
              <li>
                Merchandise must be claimed in person at the Pathixo exhibition booth counter during exhibition operating hours.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">4. Intellectual Property</h2>
            <p className="mt-2">
              All product names, logos, concepts, software designs, and proprietary trademarks including Vakxo, krocPDF, and Pathixo are the exclusive intellectual property of {siteConfig.company.legalName}.
            </p>
          </section>

          <section>
            <h2 className="text-base font-bold text-white">5. Contact Information</h2>
            <p className="mt-2">
              For inquiries regarding these terms or booth assistance:
              <br />
              <strong className="text-white">Organizer:</strong> {siteConfig.company.legalName}
              <br />
              <strong className="text-white">Email:</strong> {siteConfig.company.email}
              <br />
              <strong className="text-white">Phone:</strong> {siteConfig.company.displayPhone}
              <br />
              <strong className="text-white">Venue:</strong> {siteConfig.expo.venue}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
