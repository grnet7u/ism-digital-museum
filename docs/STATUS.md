# Status — 2026-11-01

Owner: Claude Code. Codex owns the separate StudyMate project.

## Completed
- M0 scaffold (Vite/React/Router, Supabase client guard, evolution aggregation, Vercel config, docs).
- M1 schema, auth and access — **verified against the real project**:
  - Supabase project `ism-digital-museum`, ref `csggzcpmjisspzkxrhky` (org grnet7u's Org, eu-west-3, free plan). The other project "grnet7u's Project" was not touched.
  - `supabase/migrations/20261101120000_museum_schema.sql` applied: 7 tables (all RLS on), 16 table policies, 3 storage policies, private `museum-media` bucket (5 MB, JPEG/PNG/WebP), profile trigger, `exhibits_guard` moderation trigger, 5 generic categories.
  - Auth: site URL `http://127.0.0.1:5173`, redirects `/auth/callback` (127.0.0.1 + localhost); email confirmation on. Production URL still to add in `supabase/config.toml` after Vercel deploy.
  - Test users: `rls-a@ism-museum.test`, `rls-b@ism-museum.test`, `admin@ism-museum.test` (admin via app_metadata). Passwords only in ignored `.env.local`. Use admin account for the demo.
  - Auth UI: AuthProvider (session restore), `/login`, `/register`, `/auth/callback`, logout, RequireAuth (UX only).

## Verified
- 2026-11-01 `npm run rls-check` against live project: **33/33 PASS** (visitor/A/B/admin with publishable key only; storage cross-user upload/overwrite/delete denied, wrong MIME rejected, unpublished image unsigned for visitor, publish bypass/creator_id/moderation_note/self-promotion denied, edit-published → pending, admin publish and content write allowed). Cleanup verified: 0 exhibits, 0 teachers, 0 storage objects after run.
- `npm run check` PASS — oxlint clean, Vitest 5 tests, build OK.
- NOT yet checked in a browser: register → confirmation e-mail → callback, login/logout/reload UI. Default Supabase SMTP only delivers to org members and is rate-limited; demo should log in with prepared accounts.

## Remaining
- M2 exhibit CRUD + upload UI; M3 content/admin; M4 search + Evolution UI; M5 deploy (GitHub remote, Vercel) and docs.

## Next action
M2: services for exhibits/storage, list/detail, my works, create/edit/delete with image upload, submit-for-review.
