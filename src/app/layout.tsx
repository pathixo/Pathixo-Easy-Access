import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pathixo — Intelligent Products & Custom Engineering",
  description: "Pathixo builds proprietary AI products and engineers custom software solutions for visionary businesses.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://expo.pathixo.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#09090b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#09090b] text-[#f4f4f5] antialiased selection:bg-brand-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
