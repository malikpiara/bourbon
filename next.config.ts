// Next.js configuration: security headers, canvas stub, and polyfill setup.
import type { NextConfig } from 'next';

const config: NextConfig = {
  // ── Security ──────────────────────────────────────────────────────────
  poweredByHeader: false, // Remove "X-Powered-By: Next.js" header
  compress: true, // Gzip responses (default true, explicit for clarity)
  reactStrictMode: true, // Catch bugs in development
  output: 'standalone', // Minimal build for Electron packaging

  // ── Turbopack ─────────────────────────────────────────────────────────
  // Turbopack is the default bundler in Next.js 16 for both dev and build.
  // It handles tree-shaking automatically (no need for optimizePackageImports).
  turbopack: {
    root: __dirname,
    resolveAlias: {
      canvas: './lib/stubs/canvas.js', // Stub canvas for @react-pdf/renderer
    },
  },

  // ── HTTP headers ──────────────────────────────────────────────────────
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          // Required for PDF.js SharedArrayBuffer support
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          // Security hardening
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default config;
