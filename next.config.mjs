/** @type {import('next').NextConfig} */

// Next.js dev mode uses eval-based source maps for HMR. Without 'unsafe-eval'
// the browser refuses to execute the chunks and React never hydrates.
// Production builds do not need it, so it is scoped to development only.
const isDev = process.env.NODE_ENV === "development";

// Strict Content Security Policy allowing only trusted origins
const cspHeader = `
  default-src 'self' https://*.supabase.co;
  script-src 'self' 'unsafe-inline' ${isDev ? "'unsafe-eval' " : ""}https://challenges.cloudflare.com https://va.vercel-scripts.com;
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co https://challenges.cloudflare.com https://vitals.vercel-insights.com https://*.vercel-insights.com;
  frame-src 'self' https://challenges.cloudflare.com;
  worker-src 'self' blob: https://challenges.cloudflare.com;
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
