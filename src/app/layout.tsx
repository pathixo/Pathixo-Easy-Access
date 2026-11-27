import type { Metadata, Viewport } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathixo — Intelligent Products & Custom Engineering",
  description: "Pathixo builds proprietary AI products and engineers custom software solutions for visionary businesses.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://expo.pathixo.com"),
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Pathixo — Intelligent Products & Custom Engineering",
    description: "Pathixo builds proprietary AI products and engineers custom software solutions for visionary businesses.",
    url: "https://pathixo.com",
    siteName: "Pathixo",
    images: [
      {
        url: "/assets/images/pathixo-logo.jpg",
        width: 640,
        height: 640,
        alt: "Pathixo Official Logo",
      },
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pathixo — Intelligent Products & Custom Engineering",
    description: "Pathixo builds proprietary AI products and engineers custom software solutions for visionary businesses.",
    images: ["/assets/images/pathixo-logo.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0b0c",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-[#ccff00] selection:text-black">
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
