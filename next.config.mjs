/** @type {import('next').NextConfig} */

const isDev = process.env.NODE_ENV !== "production";

// In development, Next.js requires 'unsafe-eval' for Hot Module Replacement and React Refresh runtime.
// In production, 'unsafe-eval' is strictly excluded.
const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com"
  : "'self' 'unsafe-inline' https://challenges.cloudflare.com";

// Strict Content Security Policy allowing only trusted origins
const cspHeader = `
  default-src 'self' https://*.supabase.co;
  script-src ${scriptSrc};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com;
  frame-src 'self' https://challenges.cloudflare.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: cspHeader,
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "DENY",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
