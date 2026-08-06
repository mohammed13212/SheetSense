# SheetSense

Browser-first Excel and CSV analysis tool. Upload spreadsheets and get data quality scoring, automated insights, interactive charts, and cross-dataset relationship detection — parsed entirely in-browser.

## Quick Commands

| Command | Purpose |
|---|---|
| `pnpm --filter @workspace/api-server run dev` | Start the API server (requires `PORT` + `DATABASE_URL` env vars) |
| `pnpm --filter @workspace/sheet-sense run dev` | Start the frontend dev server (requires `PORT` + `BASE_PATH` env vars) |
| `pnpm run typecheck` | Full typecheck across all packages |
| `pnpm run build` | Typecheck + build all packages |
| `pnpm --filter @workspace/api-spec run codegen` | Regenerate API hooks and Zod schemas from the OpenAPI spec |
| `pnpm --filter @workspace/db run push` | Push DB schema changes to the database (dev only) |

## Stack

- **Monorepo**: pnpm workspaces, Node.js 24, TypeScript 5.9
- **Frontend**: React 19, Vite 7, Tailwind CSS v4, Radix UI, Recharts, Wouter, Sonner
- **Backend**: Express 5, Drizzle ORM, PostgreSQL, Pino
- **Auth**: Supabase Auth (JWT verified server-side)
- **Storage**: Google Cloud Storage via Replit Object Storage
- **API contract**: OpenAPI 3 spec → Orval codegen → Zod + React Query hooks

## Where Things Live

| What | Where |
|---|---|
| DB schema | `lib/db/src/schema/` |
| OpenAPI spec | `lib/api-spec/openapi.yaml` |
| API routes | `artifacts/api-server/src/routes/` |
| Auth middleware | `artifacts/api-server/src/middlewares/auth.ts` |
| Object storage | `artifacts/api-server/src/lib/objectStorage.ts` |
| React pages | `artifacts/sheet-sense/src/pages/` |
| React context | `artifacts/sheet-sense/src/store/` |
| Translations (EN/AR) | `artifacts/sheet-sense/src/i18n/locales/` |
| File parser | `artifacts/sheet-sense/src/lib/parseFile.ts` |
| Project loader | `artifacts/sheet-sense/src/lib/projectLoader.ts` |

## Architecture Decisions

- **Local-first parsing**: SheetJS runs in the browser; raw file bytes never pass through the API server. Files are uploaded to object storage only after local parsing succeeds.
- **URL as source of truth**: Active project ID comes from the URL param (`/projects/:id`), not React state, so page refresh and deep links always work.
- **Contract-first API**: `openapi.yaml` is the single source of truth; the API server and client both use the same generated Zod schemas for validation.
- **`req.userId` pattern**: The `requireAuth` middleware sets `req.userId` from the verified Supabase JWT. Route handlers use `req.userId` — never `req.isAuthenticated()`.
- **RTL support**: `RTL_LOCALES` is typed as `readonly string[]` (not `as const`) to allow `.includes(locale)` without a TypeScript error.

## Required Environment Variables

```
# Supabase
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
SUPABASE_JWT_SECRET=

# Database
DATABASE_URL=

# Session
SESSION_SECRET=

# Object storage
DEFAULT_OBJECT_STORAGE_BUCKET_ID=
PRIVATE_OBJECT_DIR=
PUBLIC_OBJECT_SEARCH_PATHS=
```

## User Preferences

- Provide detailed explanations of architectural decisions when making significant changes.
- Keep the API contract (OpenAPI spec) as the single source of truth for types.
- All schema changes must go through Drizzle (`db push`) — no raw SQL migrations.
