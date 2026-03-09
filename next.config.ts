// Next.js configuration: security headers, bundle optimisation, and polyfill injection.
import type { NextConfig } from 'next';

const config: NextConfig = {
  // ── Security ──────────────────────────────────────────────────────────
  poweredByHeader: false, // Remove "X-Powered-By: Next.js" header
  compress: true, // Gzip responses (default true, explicit for clarity)
  reactStrictMode: true, // Catch bugs in development

  // ── Bundle optimisation ───────────────────────────────────────────────
  // Tree-shake barrel exports — only import what's used from these packages.
  optimizePackageImports: ['lucide-react', 'date-fns'],

  // ── Webpack ───────────────────────────────────────────────────────────
  webpack: (config) => {
    // Inject Promise.withResolvers polyfill as a separate entry point.
    const entry = async () => {
      const entries = await (typeof config.entry === 'function'
        ? config.entry()
        : config.entry);
      return {
        ...entries,
        polyfills: './polyfills.ts',
      };
    };

    return {
      ...config,
      entry,
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          canvas: false, // Stub canvas for @react-pdf/renderer
        },
      },
    };
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

  // ── Turbopack (dev) ───────────────────────────────────────────────────
  experimental: {
    turbo: {
      rules: {
        resolveAlias: {
          canvas: false,
        },
      },
    },
  },
};

export default config;
