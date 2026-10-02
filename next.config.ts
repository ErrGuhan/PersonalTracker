import type { NextConfig } from "next";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const nextConfig: NextConfig = {
  // ── Permanent redirects ──────────────────────────────────────────────
  async redirects() {
    return [
      { source: "/fitness",   destination: "/fit",    permanent: true },
      { source: "/routines",  destination: "/habits", permanent: true },
      { source: "/nutrition", destination: "/fuel",   permanent: true },
      { source: "/dashboard", destination: "/",       permanent: true },
      { source: "/home",      destination: "/",       permanent: true },
    ];
  },

  // ── HTTP Security Headers ────────────────────────────────────────────
  // Applied to every response. Hardened against XSS, click-jacking, and
  // data injection. CSP allows Supabase + Google Fonts + necessary CDNs.
  async headers() {
    const rawHost = SUPABASE_URL.replace(/^https?:\/\//, "").replace(/\/.*$/, "").trim();
    const supabaseHost = rawHost || "*.supabase.co";

    return [
      {
        source: "/(.*)",
        headers: [
          // Prevent MIME type sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },

          // Block the app being embedded in iframes (clickjacking)
          { key: "X-Frame-Options", value: "DENY" },

          // Disable legacy XSS filter (modern browsers use CSP instead)
          { key: "X-XSS-Protection", value: "0" },

          // Enforce HTTPS for 2 years, include subdomains
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },

          // Control referrer information sent cross-origin
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },

          // Block browser features we don't use
          {
            key: "Permissions-Policy",
            value: [
              "camera=()",
              "microphone=(self)",  // Allow for potential voice logging
              "geolocation=()",
              "payment=()",
              "usb=()",
              "fullscreen=(self)",
            ].join(", "),
          },

          // Content Security Policy
          // default-src 'self' — only load resources from our own origin
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              // Scripts: self + Next.js inline chunks + CDN scripts
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net",
              // Styles: self + Google Fonts + inline (Tailwind)
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
              // Fonts: self + Google Fonts
              "font-src 'self' data: https://fonts.gstatic.com",
              // Images: self + data URIs + Supabase storage
              `img-src 'self' data: blob: https://${supabaseHost}`,
              // Connect: self + Supabase API + analytics
              `connect-src 'self' https://${supabaseHost} wss://${supabaseHost}`,
              // Workers: self (Next.js service worker)
              "worker-src 'self' blob:",
              // Manifest: self (PWA manifest)
              "manifest-src 'self'",
              // Frame ancestors: none (complement X-Frame-Options)
              "frame-ancestors 'none'",
              // Base URI: self only
              "base-uri 'self'",
              // Form action: self only
              "form-action 'self'",
            ].join("; "),
          },

          // Permissions for cross-origin isolation
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
          { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
        ],
      },
      // No-cache for API routes / server actions
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  // ── Compiler options ─────────────────────────────────────────────────
  compiler: {
    removeConsole: process.env.NODE_ENV === "production"
      ? { exclude: ["error", "warn"] }
      : false,
  },

  // ── Images ───────────────────────────────────────────────────────────
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
        pathname: "/storage/**",
      },
    ],
  },

  // ── Performance ──────────────────────────────────────────────────────
  poweredByHeader: false, // Remove X-Powered-By header (fingerprinting)
  compress: true,
};

export default nextConfig;
