# Acceptance and regression checks

Run `npm run check` for lint, unit tests and production build. Tests in scaffold cover only aggregation, not UI or Supabase. Add tests for changed non-trivial logic.

## Auth/RLS matrix — real requests, not just hidden buttons

Use visitor, A, B and admin with their own sessions and the publishable key. Never use service role to prove RLS. Capture expected denied/no-rows vs actual outcome without tokens.

- Visitor reads published content but cannot read pending rows or signed pending media.
- A inserts with A's creator_id; insert with B's ID fails.
- A edits/deletes own record; B's same operations fail, including manual requests.
- A cannot set creator_id to B, publish directly, edit moderation note or self-promote.
- Editing published work becomes pending before public can see changed content.
- Admin publishes; visitor now reads it. Revoke publication hides record and newly requested media access.
- Teacher/event/history/category writes denied to A/B/visitor.
- Storage cross-user upload/overwrite/delete denied; owner allowed; unsupported format/oversize rejected.
- Event album access follows parent publication. Signed URL expiry/reload is handled.

## Functional checks

Signup with email confirmation on; helpful confirmation message; valid callback; login failure; logout; reload; expired session. CRUD success and validation failure; cancelled deletion; file-upload failure; database-save failure after upload; missing image and broken external link display.

Search plus all filters; URL reload and Back; zero results; reset. Teacher/detail/event/creator relations. Unknown route and missing record.

Evolution: duplicate/case/whitespace tags counted once per exhibit; unpublished excluded; empty input; no data for chosen year; two-year union; drill-down selects correct works; no silent 1000-row truncation.

## UI and deployment

360px, tablet and desktop; keyboard navigation; visible focus; field labels; error text; loading; no horizontal overflow. Public production URL tested signed-out. Refresh a nested route. Check Auth redirect URL for local and production. No secrets, private research, node_modules or .env in Git history/artifact.

## Handover demo (5–7 minutes)

1. Browse/search and detail (1 min).
2. Teachers, events, history, creator relation (1 min).
3. Signup/login or prepared demo user; create/upload/edit (1.5 min).
4. Moderation and forbidden cross-user operation (1 min).
5. Evolution comparison and drill-down (1 min).
6. ERD, RLS and build/repository explanation (0.5–1 min).

Record executed evidence in STATUS. A checklist item is not automatically a passed test.

## Running the RLS matrix

Create three test users in the museum project (A, B, admin; give only admin `app_metadata.role = admin`), put their emails/passwords and the URL/publishable key in `.env.local` (ignored by Git; no VITE_ prefix for passwords), then `npm run rls-check`. It signs in with the publishable key only and prints PASS/FAIL per scenario, cleaning up its own rows/files. Paste the summary into STATUS.
