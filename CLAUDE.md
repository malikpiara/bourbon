# Burbbon

Burbbon is a Next.js SaaS that generates PDF sales documents (delivery orders and direct sales) for a Portuguese furniture company. Uses Supabase for authentication and data persistence.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack), React 19, TypeScript 5
- **Backend:** Supabase (Auth, PostgreSQL with RLS)
- **Forms:** React Hook Form + Zod (discriminated union on `salesType`)
- **PDF:** @react-pdf/renderer (client-side generation)
- **UI:** Radix UI / shadcn components (including sidebar), Tailwind CSS
- **Analytics:** PostHog
- **Package manager:** pnpm

## Project Structure

```
app/
  (auth)/             → Login, password reset (unauthenticated)
  (app)/[orgSlug]/    → Authenticated org-scoped routes
    app-sidebar.tsx   → Sidebar navigation (conditionally shows Style Guide)
    sales/new/        → SalesForm (create new sale)
    sales/            → Sales history list
    sales/[id]/       → Sale detail/edit + PDF view
    style-guide/      → Design system page (dev-only, gated by user ID)
  layout.tsx          → Root layout (PostHog provider)
  page.tsx            → Redirect: → /login or /{orgSlug}/sales/new
components/
  documents/          → PDF document components (OrderDocument, DirectSales, PDFViewer)
  forms/sales/        → Multi-step sales form (StoreSelection, CustomerSection, ProductTable, PaymentSection)
  ui/                 → shadcn/Radix primitives (sidebar, sheet, tooltip, separator, etc.)
hooks/                → Custom React hooks (use-mobile)
lib/
  constants.ts        → Business config: payment types, VAT, max quantity
  schema.ts           → Zod validation schemas (discriminated union: direct vs delivery)
  stubs/canvas.js     → Empty stub for @react-pdf/renderer (Turbopack resolveAlias)
  supabase/
    client.ts         → Browser Supabase client (createBrowserClient)
    server.ts         → Server Supabase client (createServerClient + cookies)
    proxy.ts          → Session refresh helper for proxy.ts (getClaims)
    queries/          → Read queries (organization.ts, stores.ts)
    mutations/        → Write operations (sales-document.ts)
proxy.ts              → Next.js 16 proxy (replaces middleware.ts)
supabase/
  migrations/         → SQL migrations (pushed via supabase db push)
  seed.sql            → Org + stores seed data
types/
  document.ts         → DocumentData, Order, Customer, OrderItem interfaces
utils/
  format/             → Formatting helpers (phone, postal code, capitalisation, orderData transform)
  generateOrderNumber.ts → Non-sequential order number generator (YYMM-XXXX)
polyfills.ts          → Promise.withResolvers polyfill (imported in providers.tsx)
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
- **Single source of truth:** Business constants (payment types, VAT, max quantity) live in `lib/constants.ts`. Stores and company info come from Supabase (`organizations` and `stores` tables). Types are derived from the constant arrays where possible (e.g. `PaymentTypeValue`).
- **Schema-driven:** Form validation and types flow from Zod schemas in `lib/schema.ts`. The `FormValues` type is inferred from the schema.
- **Formatting pipeline:** Raw form values → `formatOrderData(values, { company, storeCode })` → `DocumentData` → PDF components. The transform in `utils/format/orderData.ts` is the single normalisation boundary. `unitPrice` is always `number` after Zod transformation. Company and store code are passed in from Supabase data, not hardcoded.
- **Total computation:** Use `computeTotal()` from `utils/format/total.ts` instead of inline reduce calls. For raw form values where `unitPrice` may still be a string, `parseUnitPrice()` handles comma-decimal parsing.
- **Address fields:** `AddressFieldGroup` is a reusable component for delivery and billing address blocks (field names mapped via props). Postal code lookup is async (lazy-loads the 5.3 MB JSON on first use).
- **Form type narrowing:** `PaymentSection` receives `UseFormReturn<FormValues>` but narrows to `UseFormReturn<DeliveryFormValues>` at the component boundary (safe because it only renders when `salesType === 'delivery'`).
- **Polyfills:** `Promise.withResolvers` polyfill is imported in `app/providers.tsx` (module-level). A defensive copy also exists in `PDFViewer.tsx` for older browsers. Do not remove the PDFViewer copy.
- **Pre-commit:** Husky + lint-staged runs ESLint and Prettier on staged files. All commits must pass.
- **Testing:** The user prefers to test the dev server themselves in VSCode. Do not create launch.json or start dev servers automatically.

## Navigation

- **Sidebar-based:** Uses shadcn `SidebarProvider` + `Sidebar` component in the org layout. Collapsible via `SidebarTrigger` button or `Cmd+B` keyboard shortcut. On mobile, renders as a sheet overlay.
- **AppSidebar:** Client component (`app/(app)/[orgSlug]/app-sidebar.tsx`) with nav links, sign-out button, and conditionally visible Style Guide link (gated by user ID).
- **Style Guide:** Internal page at `/[orgSlug]/style-guide` for previewing UI components and testing design tokens (fonts, primary color hue, border radius). Only visible in the sidebar for the designated developer user ID.

## Auth Architecture

- **Proxy-based:** `proxy.ts` (root) calls `updateSession()` which uses `getClaims()` for local JWT validation (no network call).
- **Route protection:** Unauthenticated users are redirected to `/login`. Auth routes (`/login`, `/reset-password`, `/auth`) are excluded from the redirect.
- **Multi-tenancy:** All data tables are scoped by `org_id` via RLS policies using `get_user_org_ids()` helper function. Users are linked to orgs via `organization_members` bridge table.
- **Electron compatibility:** All data fetching uses the browser Supabase client directly (not server actions or API routes).

## Database

- **Migrations:** Managed via Supabase CLI (`supabase db push`). Migration files in `supabase/migrations/`.
- **Schema:** `organizations`, `stores`, `profiles`, `organization_members`, `sales_documents`, `sales_document_items`, `sales_document_payments`.
- **Hybrid storage:** `sales_documents` has both normalized columns (for querying) and a `form_data` JSONB column (for form rehydration), versioned via `form_data_version`.
- **RLS:** All tables use Row Level Security. No DELETE policy on `sales_documents` (immutable).

## Key Patterns

- **Discriminated union:** `salesType: 'direct' | 'delivery'` drives form fields, validation, and PDF output. Delivery requires address, phone, email, payments; direct does not.
- **Phone input:** Uses `react-phone-number-input` (E.164 format). The `CountrySelect` component has a `safeGetCallingCode` wrapper to prevent render-time crashes from invalid country codes.
- **Error boundaries:** `app/error.tsx` (segment-level) and `app/global-error.tsx` (root-level) catch unhandled errors with a Portuguese retry UI.

## Gotchas

- `unitPrice` in the form layer (Zod schema) accepts `string | number` input but always transforms to `number`. The `OrderItem` interface and all downstream code (PDF components, orderData) use strictly `number`. Only `computeTotal`/`parseUnitPrice` handle the string case for reactive form watchers.
- The postal code JSON (`postalCodeMap.json`, ~5.3 MB) is lazy-loaded via dynamic `import()` on first postal code blur. Cached after first load. Do not convert back to a static import.
- **Turbopack `resolveAlias`** does not support `false` like webpack. Use stub files instead (e.g. `lib/stubs/canvas.js`).
- **`supabase init`** creates a `.idea/deno.xml` file (JetBrains Deno config for Edge Functions). This is ignored via `.gitignore`.
- **Supabase join types:** When querying with `.select('..., table(cols)')`, the joined data may be inferred as an array. Use explicit interfaces and cast `data as YourType` to handle this.
- **ESLint config:** `eslint-config-next@16` exports native flat config arrays. Do not use `FlatCompat` — it causes circular JSON errors. Use `eslint-config-prettier/flat` (not the default export). The lint script is `eslint .` (not `next lint`, which is broken in Next.js 16).
- **Order numbers:** Generated client-side via `generateOrderNumber()` (format: `YYMM-XXXX`). `orderNumber` in the Zod schema accepts `string | number` and transforms to string. The `UNIQUE(org_id, order_number)` constraint handles collisions.
