---
name: SheetSense Auth & Project Architecture
description: Key decisions and constraints for the SheetSense auth + persistence layer.
---

## Auth (Supabase)
- Supabase credentials stored as shared env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`
- Frontend singleton client in `artifacts/sheet-sense/src/lib/supabase.ts`
- `AuthContext` (`src/store/AuthContext.tsx`) wraps the whole app; provides `user`, `session`, `loading`, `signIn`, `signUp`, `signOut`, `resetPassword`
- Route guards: `ProtectedRoute` (→ /login) and `GuestRoute` (→ /dashboard) in `src/components/auth/ProtectedRoute.tsx`

## DB Schema
- `projects` table has `user_id text NOT NULL` (Supabase auth UID)
- `uploaded_files` table is linked to projects via FK with `ON DELETE CASCADE`
- Schema lives in `lib/db/src/schema/`; use `drizzle-kit push` in `lib/db/` to migrate (no migrations folder — push-only)

**Why:** Added `userId` column to scope every project to exactly one Supabase user.

## API Server Auth
- `artifacts/api-server/src/middlewares/auth.ts` — `requireAuth` middleware verifies Supabase JWT via `supabase.auth.getUser(token)`
- Reads `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` (shared vars; accessible from Node.js too despite VITE_ prefix)
- All project + file routes are auth-gated; userId injected as `req.userId`

## Frontend API Client
- `src/lib/api.ts` — thin fetch wrapper that reads the Supabase session JWT and sends it as `Authorization: Bearer`
- API server is served at `/api` path (same origin); no base URL prefix needed. `BASE_URL` in Vite = `/`

## Project State
- `ProjectContext` (`src/store/ProjectContext.tsx`) tracks the currently open server-side project in memory
- `setActiveProject()` / `clearActiveProject()` — called from Dashboard and Home
- Persistence is best-effort: file upload saves to DB in background; failures don't block local analysis

## Navigation
- `AppHeader` shows Dashboard/Workspace/Relationships nav when `isInWorkspace=true` and user is authenticated
- Unauthenticated landing: shows Log In / Sign Up; authenticated landing: shows Dashboard button
- `ERR_INVALID_URL` in browser console is pre-existing (Replit dev plugin), not related to app code
