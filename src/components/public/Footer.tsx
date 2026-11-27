import Link from "next/link";
import { siteConfig } from "@/config/site";
import { Mail, Phone, MapPin, Globe, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#09090b] py-12 text-neutral-400 sm:py-16">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
          {/* Company Column */}
          <div className="sm:col-span-2">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-600 text-sm font-extrabold text-white">
                P
              </span>
              <span>{siteConfig.company.legalName}</span>
            </div>
            <p className="mt-3 max-w-md text-xs leading-relaxed text-neutral-400 sm:text-sm">
              {siteConfig.company.description}
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-neutral-500">
              <MapPin className="h-3.5 w-3.5 text-brand-400 shrink-0" />
              <span>{siteConfig.expo.venue}</span>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Connect Directly
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <a
                  href={`mailto:${siteConfig.company.email}`}
                  className="flex items-center gap-2 transition hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5 text-brand-400" />
                  <span>{siteConfig.company.email}</span>
                </a>
              </li>
              <li>
                <a
                  href={`tel:${siteConfig.company.phone}`}
                  className="flex items-center gap-2 transition hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5 text-brand-400" />
                  <span>{siteConfig.company.displayPhone}</span>
                </a>
              </li>
              <li>
                <a
                  href={siteConfig.company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition hover:text-white"
                >
                  <Globe className="h-3.5 w-3.5 text-brand-400" />
                  <span>pathixo.com</span>
                  <ExternalLink className="h-2.5 w-2.5 text-neutral-500" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Policy */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white">
              Compliance & Legal
            </h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/privacy" className="transition hover:text-white">
                  Privacy Policy (DPDP Act)
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition hover:text-white">
                  Terms & Lucky Draw Rules
                </Link>
              </li>
              <li>
                <Link href="/spin" className="transition hover:text-white">
                  Lucky Draw Redemption
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between border-t border-white/5 pt-6 text-[11px] text-neutral-500 sm:flex-row">
          <p>© {new Date().getFullYear()} {siteConfig.company.legalName}. All rights reserved.</p>
          <p className="mt-2 sm:mt-0">
            Crafted for {siteConfig.expo.eventName} • Mobile-First Experience
          </p>
        </div>
      </div>
    </footer>
  );
}
