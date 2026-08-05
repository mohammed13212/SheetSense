---
name: SheetSense Auth & Project Architecture
description: Supabase auth, DB schema, API patterns, ProjectContext, routing, object storage, and persistence decisions.
---

## Auth
- Supabase auth (not Replit Auth). JWT middleware: `requireAuth` in `artifacts/api-server/src/middlewares/auth.ts`.
- `req.userId` is set by `requireAuth`. Never use `req.isAuthenticated()` (Replit Auth pattern).
- Frontend Supabase client: `artifacts/sheet-sense/src/lib/supabase.ts`.
- Auth session token extracted via `supabase.auth.getSession()` for storage API calls.

## Database Schema
- Projects: `projectsTable` — now includes `lastOpenedAt` (nullable timestamp) for "recently opened" sorting.
- Files: `uploadedFilesTable` — now includes `storageKey` (GCS object path) and `displayName`.
- Relationships: `relationshipsTable` — already existed with full schema.
- Drizzle ORM, PostgreSQL. Push schema: `pnpm --filter @workspace/db run push`.

## API Routes (all require `requireAuth`)
- `GET/POST /api/projects` — list (sorted lastOpenedAt DESC NULLS LAST, createdAt DESC) and create.
- `GET/PATCH/DELETE /api/projects/:id` — single project with files attached.
- `PATCH /api/projects/:id/touch` — sets lastOpenedAt = now. Called fire-and-forget on project open.
- `GET/POST /api/projects/:id/files` — file list and create (accepts storageKey).
- `GET/POST/DELETE /api/projects/:id/relationships` — relationship CRUD with ownership checks.
- `POST /api/storage/uploads/request-url` — returns GCS presigned PUT URL + objectPath.
- `GET /api/storage/objects/*` — serves private file binaries with ownership check via DB join.
- `GET /api/storage/public-objects/*` — serves public assets (no auth).

## Object Storage
- Bucket ID in env: `DEFAULT_OBJECT_STORAGE_BUCKET_ID`.
- `ObjectStorageService` in `artifacts/api-server/src/lib/objectStorage.ts`.
- Upload flow: client requests presigned URL → PUT binary directly to GCS → save objectPath as `storageKey` in DB.
- `storageKey` format: `/objects/uploads/<uuid>`. Serve route strips leading `/objects` for the wildcard.
- Storage upload is best-effort — analysis always works locally even if storage fails.

## URL Structure (Approved Architecture)
- `/` — public landing page. Authenticated users redirect to `/dashboard`.
- `/dashboard` — project list, sorted by recently opened.
- `/projects/:projectId` — workspace (ProjectWorkspace.tsx). Source of truth for active project.
- `/projects/:projectId/relationships` — RelationshipManager with persistence.
- `/login`, `/signup`, `/forgot-password` — auth pages.
- Legacy `/relationships` redirects to `/dashboard` (no project context).

## Frontend State Architecture
- `ProjectContext` — activeProject (id, name, files), relationships (PersistedRelationship[]).
- `DatasetContext` — in-memory datasets (Dataset[]). `addDataset(file, opts?)` accepts `serverFileId`.
- `Dataset.serverFileId` — bridges local dataset id (`ds_...`) to DB UUID for relationship persistence.
- `loadProject(projectId)` in `lib/projectLoader.ts` — fetches project + downloads binaries + parses + loads relationships.
- `uploadToStorage(file)` in `lib/projectLoader.ts` — requests presigned URL, PUTs binary to GCS, returns objectPath.

## i18n Notes
- `RTL_LOCALES` is exported from `i18n/types.ts` as `readonly string[]` (not `as const` tuple) to avoid TS2345 with `includes()`.
- `types.ts` key names MUST match the locale files exactly. Previous rewrite broke alignment — be careful.
- Locale files are the source of truth for key names (en.ts, ar.ts).

## Codegen (lib/api-spec)
- `pnpm --filter @workspace/api-spec run codegen` — runs orval then `tsc --build`.
- orval APPENDS to `lib/api-zod/src/index.ts` — do NOT manually edit that file; let orval own it.
- The `schemas` option was removed from orval zod config to avoid name collisions between Zod schemas and TS interfaces.
- Generated Zod schemas are in `lib/api-zod/src/generated/api.ts`.

## Dataset Rename/Delete Persistence
- `PATCH /api/projects/:projectId/files/:fileId` — updates `displayName` (nullable). Verified ownership via project.
- `DELETE /api/projects/:projectId/files/:fileId` — deletes DB record first, then fires GCS delete as best-effort (non-fatal).
- `ObjectStorageService.deleteObject(storageKey)` — silently succeeds on ObjectNotFoundError.
- `ProjectContext` now has `removeFileFromProject(fileId)` and `updateFileDisplayName(fileId, displayName)`.
- DatasetSidebar rename: `renameDataset()` (local) → `apiPatch` → `updateFileDisplayName` (context). Error toast on failure.
- DatasetSidebar delete: optimistic hide → undo toast → on toast expire: `removeDataset()` (local) + `apiDelete` + `removeFileFromProject`. The server is only called after the undo window closes, never on undo.

## RelationshipManager Resilience (Direct Navigation)
- On mount, RelationshipManager checks `activeProject?.id === projectId`. If they differ, it calls `loadProject()` (dynamic import to avoid circular deps) and fully hydrates DatasetContext + ProjectContext.
- `hydratedIdRef` prevents double-hydration. `mappedOnceRef` prevents re-seeding local relationships after the user has made edits.
- Shows loading/not-found/error screens (matching ProjectWorkspace pattern) during hydration.
- The persisted→local relationship mapping effect now has proper deps (`[pageLoadState, persistedRels, datasets]`) instead of the previous empty deps `[]`, so it fires after async hydration completes.

## Quirks / Non-obvious Decisions
- `next-themes` in `ui/sonner.tsx` causes a cosmetic `ERR_INVALID_URL` in browser console — harmless.
- `pino-http` provides `req.log` on all requests — use it for structured logging in routes.
- The `relationships.ts` route validates that both files belong to the project before inserting.
- `DatasetSidebar` upload flow (authenticated): parse → upload to storage → save to API with storageKey → addDataset with serverFileId. Storage failure is non-fatal.
- `not-found.tsx` is lowercase with hyphen (not `NotFound.tsx`) — use `import("@/pages/not-found")`.
