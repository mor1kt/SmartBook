# SmartBook (MVP Scaffold)

Production-ready monorepo scaffold for **SmartBook**, a **multi-tenant B2B SaaS** for educational centers.

## Architecture (multi-tenant, critical)

- **No shared/global business data across centers.**
- **Every domain entity must include `center_id`** (FK to `centers.id`).
- Public center page is accessible via a **unique public link** (e.g. `/c/:centerSlug`).

This repository intentionally contains **only wiring + structure** (no product features yet).

## Repo layout

- `apps/backend` — Node.js (Express) + TypeScript API
- `apps/frontend` — React (Vite) + TypeScript web app
- `supabase` — SQL schema + notes for RLS (multi-tenant isolation)

## Prerequisites

- Node.js 20+ (recommended)
- A Supabase project (URL + keys)

## Environment

Copy env examples and fill values:

- `apps/backend/.env.example` → `apps/backend/.env`
- `apps/frontend/.env.example` → `apps/frontend/.env`

## Install

```bash
npm install
```

## Dev

```bash
npm run dev
```

Backend runs on `http://localhost:4000` by default. Frontend runs on Vite default port (usually `5173`).

## Build

```bash
npm run build
```

## Notes

- Backend uses Supabase **service role** key for server-side access (never expose it to the browser).
- Frontend uses Supabase **anon** key.
- `qrcode` dependency is included for future QR generation use-cases.

