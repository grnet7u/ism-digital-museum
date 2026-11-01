# Status — 2026-11-01

Owner: Claude Code. Codex owns the separate StudyMate project.

## Completed
- M0 scaffold (Vite/React/Router, Supabase client guard, evolution aggregation, Vercel config, docs).
- M1 code (cloud acceptance pending):
  - `supabase/migrations/20261101120000_museum_schema.sql`: 7 tables, FKs, checks, indexes, grants, RLS on every table, signup profile trigger, `exhibits_guard` moderation trigger, private `museum-media` bucket + storage policies, 5 generic categories. Design notes in ARCHITECTURE "Implemented in M1".
  - Auth UI: `AuthProvider` (session restore + listener), `/login`, `/register` (confirmation-required message), `/auth/callback`, logout, `RequireAuth` (UX only) for `/my-works` and admin-only `/admin`.
  - `scripts/rls-check.mjs` (`npm run rls-check`): 30+ real-request checks for visitor/A/B/admin incl. storage, self-promotion, publish bypass.

## Verified
- 2026-11-01: `npm run check` PASS — oxlint clean, Vitest 2 files / 5 tests, Vite build OK.
- `node --check scripts/rls-check.mjs` OK. `npm run rls-check` NOT run: no `.env.local` / Supabase project yet.
- Migration NOT applied anywhere; SQL not executed against Postgres yet.

## Remaining / blockers
- **Blocker:** dedicated Supabase project not identified. Needed from student: create/choose project, put URL + publishable key in `.env.local`, apply migration, enable email confirmation, set Site URL / redirect `http://127.0.0.1:5173/auth/callback`, create test users A/B/admin.
- M1 exit (RLS matrix pass, signup/confirm/reload in browser) not yet proven.
- M2–M5 not started. No GitHub remote, no Vercel URL.

## Next action
1. Student sets up Supabase (above); Claude applies/verifies migration, runs `npm run rls-check`, records results here.
2. Meanwhile continue M2 (exhibit CRUD + upload UI) — independent of the cloud project.
