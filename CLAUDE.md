# Bourbn (Hermes)

Bourbn is a client-side Next.js SaaS that generates PDF sales documents (delivery orders and direct sales) for a Portuguese furniture company. Version 0.1 — no backend yet; Supabase is planned.

## Tech Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript 5
- **Forms:** React Hook Form + Zod (discriminated union on `salesType`)
- **PDF:** @react-pdf/renderer (client-side generation)
- **UI:** Radix UI / shadcn components, Tailwind CSS
- **Analytics:** PostHog
- **Package manager:** pnpm

## Project Structure

```
app/            → Next.js App Router (single route + error boundaries)
components/
  documents/    → PDF document components (OrderDocument, DirectSales, PDFViewer)
  forms/sales/  → Multi-step sales form (StoreSelection, CustomerSection, ProductTable, PaymentSection)
  ui/           → shadcn/Radix primitives
hooks/          → Custom React hooks
lib/
  constants.ts  → Business config: stores, payment types, VAT, company info
  schema.ts     → Zod validation schemas (discriminated union: direct vs delivery)
types/
  document.ts   → DocumentData, Order, Customer, OrderItem interfaces
utils/
  format/       → Formatting helpers (phone, postal code, capitalisation, orderData transform)
polyfills.ts    → Promise.withResolvers polyfill (injected via webpack entry)
```

## Commands

```bash
pnpm dev          # Start dev server (Turbopack)
pnpm build        # Production build (also runs type checking)
pnpm type-check   # TypeScript type checking only (no build output)
pnpm lint         # ESLint
pnpm format       # Prettier
```

## Conventions

- **File comments:** Add a brief comment at the top of every file explaining its purpose.
- **Language:** UI text is in Portuguese. Code, comments, and commit messages are in English.
- **Single source of truth:** Business constants (stores, payment types, quantities) live in `lib/constants.ts`. Types are derived from the constant arrays where possible (e.g. `PaymentTypeValue`).
- **Schema-driven:** Form validation and types flow from Zod schemas in `lib/schema.ts`. The `FormValues` type is inferred from the schema.
- **Formatting pipeline:** Raw form values → `formatOrderData()` → `DocumentData` → PDF components. The transform in `utils/format/orderData.ts` is the single normalisation boundary. `unitPrice` is always `number` after Zod transformation.
- **Total computation:** Use `computeTotal()` from `utils/format/total.ts` instead of inline reduce calls. For raw form values where `unitPrice` may still be a string, `parseUnitPrice()` handles comma-decimal parsing.
- **Address fields:** `AddressFieldGroup` is a reusable component for delivery and billing address blocks (field names mapped via props). Postal code lookup is async (lazy-loads the 5.3 MB JSON on first use).
- **Form type narrowing:** `PaymentSection` receives `UseFormReturn<FormValues>` but narrows to `UseFormReturn<DeliveryFormValues>` at the component boundary (safe because it only renders when `salesType === 'delivery'`).
- **Polyfills:** `Promise.withResolvers` polyfill exists in two places intentionally — `polyfills.ts` (canonical, webpack-injected) and `PDFViewer.tsx` (defensive try-catch fallback for older browsers). Do not remove the PDFViewer copy.
- **Pre-commit:** Husky + lint-staged runs ESLint and Prettier on staged files. All commits must pass.

## Key Patterns

- **Discriminated union:** `salesType: 'direct' | 'delivery'` drives form fields, validation, and PDF output. Delivery requires address, phone, email, payments; direct does not.
- **Phone input:** Uses `react-phone-number-input` (E.164 format). The `CountrySelect` component has a `safeGetCallingCode` wrapper to prevent render-time crashes from invalid country codes.
- **Error boundaries:** `app/error.tsx` (segment-level) and `app/global-error.tsx` (root-level) catch unhandled errors with a Portuguese retry UI.

## Gotchas

- `unitPrice` in the form layer (Zod schema) accepts `string | number` input but always transforms to `number`. The `OrderItem` interface and all downstream code (PDF components, orderData) use strictly `number`. Only `computeTotal`/`parseUnitPrice` handle the string case for reactive form watchers.
- The postal code JSON (`postalCodeMap.json`, ~5.3 MB) is lazy-loaded via dynamic `import()` on first postal code blur. Cached after first load. Do not convert back to a static import.
