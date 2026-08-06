# SheetSense

**SheetSense** is a browser-first Excel and CSV analysis tool. Upload a spreadsheet and instantly get data quality scoring, automated insights, interactive charts, and cross-dataset relationship detection — all parsed locally in your browser so your data never leaves your device.

Authenticated users can save projects to the cloud, persist files across sessions, and manage multiple datasets under named projects.

---

## Features

### Core Analysis
- **Local-first parsing** — `.xlsx`, `.xls`, and `.csv` files are parsed entirely in-browser using SheetJS. No data is sent to any server.
- **Data Quality Dashboard** — automatic quality scoring (0–100) with breakdown of missing values, duplicate rows, empty columns, and column type distribution.
- **Rule-based Insights Engine** — generates contextual recommendations about dataset health, readiness for visualisation, and cleaning priorities.
- **Interactive Charts** — bar, pie, line, and histogram views auto-generated from detected column types (Recharts).
- **Data Preview** — paginated table view with column sorting and full-text row search.

### Project Management (authenticated)
- **Named projects** — create projects with explicit names; all files and relationships are scoped to a project.
- **Cloud file persistence** — raw file binaries are uploaded to object storage and re-parsed on project reopen, keeping analysis live rather than serving stale snapshots.
- **Dataset rename & delete** — changes sync to the server and survive browser refresh.
- **Recently opened** — dashboard sorts projects by last-opened timestamp.

### Relationship Manager
- **Auto-detection** — suggests cross-dataset column relationships based on name similarity and data type matching, with high / medium / low confidence levels.
- **Manual relationships** — define, edit, and delete JOIN relationships between any two datasets.
- **Visual relationship diagram** — SVG canvas showing all defined relationships.
- **Persistent relationships** — saved to the database and restored on project reopen.

### Platform
- **Authentication** — email/password sign-up and login via Supabase Auth.
- **Internationalisation** — full English and Arabic (RTL) UI, switchable at runtime.
- **Dark / light theme** — system-preference aware, manually overridable.
- **Deep-link resilient** — navigating directly to `/projects/:id` or `/projects/:id/relationships` (e.g. bookmark or page refresh) fully re-hydrates the project from the server.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend framework | React 19 + TypeScript |
| Build tool | Vite 7 |
| Styling | Tailwind CSS v4 + Radix UI primitives |
| Charts | Recharts |
| Routing | Wouter |
| Toasts | Sonner |
| File parsing | SheetJS (xlsx) |
| Auth | Supabase Auth |
| Backend | Express 5 + TypeScript |
| ORM | Drizzle ORM |
| Database | PostgreSQL |
| Object storage | Google Cloud Storage (via Replit Object Storage) |
| Logging | Pino + pino-http |
| API contract | OpenAPI 3 spec + Orval codegen + Zod validation |
| Monorepo | pnpm workspaces |

---

## Repository Structure

```
.
├── artifacts/
│   ├── sheet-sense/          # React frontend (Vite)
│   │   └── src/
│   │       ├── components/   # UI components
│   │       ├── pages/        # Route-level pages
│   │       ├── store/        # React context (auth, datasets, project, theme)
│   │       ├── lib/          # Parsing, API client, project loader
│   │       └── i18n/         # EN + AR translations
│   └── api-server/           # Express REST API
│       └── src/
│           ├── routes/       # projects, files, relationships, storage
│           ├── middlewares/  # Supabase JWT auth
│           └── lib/          # Object storage, ACL
├── lib/
│   ├── db/                   # Drizzle schema + migrations
│   ├── api-spec/             # OpenAPI YAML + Orval config
│   ├── api-zod/              # Generated Zod schemas
│   └── api-client-react/     # Generated React Query hooks
└── scripts/                  # Post-merge setup script
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 9+
- A [Supabase](https://supabase.com/) project (for auth + database)
- A PostgreSQL database (Supabase provides one, or use your own)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sheetsense.git
cd sheetsense
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|---|---|
| `VITE_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → `anon` `public` key |
| `DATABASE_URL` | Supabase → Project Settings → Database → Connection string (Transaction pooler recommended) |
| `SUPABASE_JWT_SECRET` | Supabase → Project Settings → API → JWT Secret |
| `SESSION_SECRET` | Any random string (32+ characters) |
| `DEFAULT_OBJECT_STORAGE_BUCKET_ID` | Your GCS bucket ID (Replit Object Storage or self-hosted) |
| `PRIVATE_OBJECT_DIR` | GCS path prefix for private uploads, e.g. `/my-bucket/private` |
| `PUBLIC_OBJECT_SEARCH_PATHS` | Comma-separated GCS paths for public assets |

> **Note on `VITE_SUPABASE_ANON_KEY`:** The anon key is designed by Supabase to be public — it is safe to use in client-side code. Security is enforced by Row Level Security (RLS) policies on the database, not by keeping this key secret. Do **not** use the service role key here.

### 4. Push the database schema

```bash
pnpm --filter @workspace/db run push
```

### 5. Run in development

Start both the API server and the frontend in separate terminals:

```bash
# Terminal 1 — API server (http://localhost:8080)
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend (Vite dev server)
pnpm --filter @workspace/sheet-sense run dev
```

Or start everything from the workspace root:

```bash
pnpm -r --parallel --if-present run dev
```

### 6. Regenerate API types (after changing openapi.yaml)

```bash
pnpm --filter @workspace/api-spec run codegen
```

---

## Screenshots

> Screenshots to be added after the first public release.

| Dashboard | Workspace | Relationship Manager |
|---|---|---|
| _coming soon_ | _coming soon_ | _coming soon_ |

---

## Architecture Notes

**File parsing is entirely local.** SheetJS runs in the browser; file bytes never reach the API server. When a user is authenticated, the raw binary is uploaded to object storage *after* local parsing is complete. On project reopen, the binary is downloaded and re-parsed — ensuring the analysis reflects the live file, not a stale server-side snapshot.

**The project is the primary object.** All datasets, relationships, and display names are scoped to a named project. The project ID is the source of truth for routing (`/projects/:id`), not React state.

**The API is contract-first.** `lib/api-spec/openapi.yaml` is the single source of truth. Orval generates Zod validation schemas and React Query hooks from it; the API server uses the same Zod schemas for request validation.

---

## Future Improvements

- **AI-powered insights** — integrate an LLM to generate natural-language summaries and actionable recommendations beyond the rule-based engine.
- **CSV/Excel export** — let users export filtered or transformed data back to file.
- **Column-level profiling** — histogram, top-N values, and cardinality stats per column in the sidebar.
- **Collaborative projects** — share a project with other users, with read/write access control.
- **Dataset versioning** — track changes when a file is re-uploaded to the same project.
- **Scheduled re-imports** — connect to a URL or cloud storage path and refresh the dataset on a schedule.
- **End-to-end tests** — Playwright test suite covering the full create → upload → reopen → analyse flow.

---

## License

MIT — see [LICENSE](LICENSE) for details.
