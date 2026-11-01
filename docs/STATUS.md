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

- M2 exhibit slice: services (`src/services/exhibits.js`, `storage.js`), `/exhibits` list, `/exhibits/:id` detail (direct URL, not-found/permission shown alike), `/my-works` (status badges, admin note, submit-for-review, inline delete confirmation), `/my-works/new` + `/my-works/:id/edit` (validation, local preview, JPEG/PNG/WebP ≤5 MB). Upload → save row → remove new upload on failure; replacement deletes old file only after the row saves; delete removes row first, then file, and reports cleanup failure. Shared `useLoad` + `LoadState` give loading/error-with-retry/empty states.

## Verified
- 2026-11-01 `npm run rls-check` against live project: **33/33 PASS** (visitor/A/B/admin with publishable key only; storage cross-user upload/overwrite/delete denied, wrong MIME rejected, unpublished image unsigned for visitor, publish bypass/creator_id/moderation_note/self-promotion denied, edit-published → pending, admin publish and content write allowed). Cleanup verified: 0 exhibits, 0 teachers, 0 storage objects after run.
- `npm run check` PASS — oxlint clean (0 warnings), Vitest 4 files / 12 tests (incl. upload/save compensation with mocked client), build OK.
- 2026-11-01 browser (Chrome, localhost:5173) as creator A: login → empty-form validation errors → create draft with PNG (preview shown, duplicate tag 'react' removed) → edit with javascript: URL rejected → valid edit saved as pending → full reload keeps session and status → replace image (DB check: new path, 1 object, old file gone) → cancel delete → confirm delete. DB afterwards: 0 exhibits, 0 storage objects.
- Login and reload session restore verified in browser (above). NOT yet checked: register → confirmation e-mail → callback, logout. Default Supabase SMTP only delivers to org members and is rate-limited; demo should log in with prepared accounts.

## Remaining
- Not exercised in browser: admin publish UI (M3 admin), DB-save failure after upload (covered by unit test only), oversize/GIF rejection in UI (unit-tested; bucket limit verified by rls-check MIME case).
- M3 content/admin; M4 search + Evolution UI; M5 deploy (GitHub remote, Vercel) and docs.

## Next action
M3: admin page (exhibit moderation: publish / return to draft with note; teacher/event/history/category management), public teachers/events/history/creators pages, content import from reviewed teacher research.
