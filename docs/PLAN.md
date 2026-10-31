# ISM Digital Museum — implementation contract

## Goal and scope

An interactive departmental museum for UFE: exhibits, teachers, event albums, history, creators and Technology Evolution. Individual student assignment. Due Monday 2026-11-02 10:40 Ulaanbaatar; freeze features before final QA. This plan is the implementation source of truth; original PDF remains authoritative for grading.

The student uses VS Code + Claude Code + Codex. This repository is independent from StudyMate. The initial setup is not a finished museum. Final acceptance requires real PostgreSQL data, Supabase Auth/Storage/RLS and a public URL.

## Requirements and acceptance mapping

| ID | Requirement | Acceptance evidence |
|---|---|---|
| WEB-01 | Home, exhibit list/details; image, description, year, author, technologies, links | Published records from DB render; direct detail URL works |
| WEB-02 | Teacher profiles: name, position, courses, bio, photo | Approved information imported, missing fields handled honestly |
| WEB-03 | Events with name/date/description/photo album | Event opens, album images load, accessible captions |
| WEB-04 | Department history | Verified milestones ordered by year; sources documented |
| WEB-05 | ISM Creators | Public profile links to the user's published exhibits |
| WEB-06 | Name search, year/category/technology filters | Combined filters work; clear/reset and no-results state |
| WEB-07 | Signup/login/logout, visitor/creator/admin | Reload restores valid session; forbidden requests rejected |
| WEB-08 | CRUD and image uploads | Data persists after reload; image stored in Supabase |
| WEB-09 | Technology Evolution | Year timeline, tech counts, two-year comparison, drill-down to exhibits |
| WEB-10 | Responsive, validation, loading/errors | Mobile 360px and desktop; keyboard and form checks |
| WEB-11 | Delivery | GitHub history, README, public URL, ERD, wireframe, 5–7 minute demo |

Grading: React/JS 20, Supabase/database 20, core functions 20, creative feature 20, UI/UX 10, repository/docs/demo 10. Technology Evolution is REQUIRED, not bonus work. Additional +5 bonus is outside current scope.

## Decisions

- React JavaScript + Vite + React Router; simple CSS; Supabase JS SDK.
- Hosted Supabase is enough; no local Docker requirement and no custom server.
- UI calls small domain service modules; keep data fetching out of repeated cards.
- Local form/list state + a small auth context; avoid Redux or a new query library until justified.
- Categories are relational; technologies are normalized strings in a Postgres text array. Counts are per distinct technology per published exhibit.
- Start with limited but meaningful content: collected teacher records, a few approved events, multiple-year exhibits for comparison. Sample exhibits must say Demo. Numbers here are development targets, not invented assignment requirements.
- Public portfolio fields are separate from Auth email. Do not expose contact fields by default.
- Admin account set by trusted backend/dashboard; users cannot self-promote.
- `draft → pending → published`; rejected work returns to draft with feedback. Editing published content returns it to pending. Publish transition is admin-only and enforced in DB.

## M0 — environment (prepared scaffold; verify STATUS)

Inputs: package files, instructions, design reference. Deliver independent install, routes, client config guard, deployment config, test runner, local Git, clear status. Pass npm run check. This phase does not create remote accounts or claim the assignment is complete.

## M1 — schema, auth and access (estimate 2–3 hours)

1. Identify intended Supabase project; configure .env.local privately. Never reuse an unrelated project by guessing.
2. Implement tables and relations from ARCHITECTURE; add grants/RLS and useful indexes. Generate migrations with Supabase tooling when available; document exactly how SQL was applied.
3. Implement signup/login/logout, confirmation-required state, auth callback and session restoration. Handle profile creation idempotently (database trigger preferred, tested), never leave an unexplained authenticated user without a profile.
4. Create auth provider and protected routes; routes improve UX, RLS enforces security.
5. Secure admin role and storage paths. Do not put role in user_metadata or an editable profile field.
6. Test as visitor, creator A, creator B and admin. Fail the phase if direct API access bypasses the UI restriction.

Exit: two users cannot mutate each other's records/files; unpublished records hidden; basic auth works including reload and confirmation flow. Keep a reproducible policy-test procedure.

## M2 — complete exhibit slice (estimate 2 hours)

Implement list, details, my works, create/edit/delete, category selection, technologies, year, links and image upload. Order: form validation → upload unique path → save row → compensate new upload if row save fails. Replacement: upload new file → persist new path → delete old file, reporting cleanup failures. Delete with confirmation and retryable cleanup; do not report success while DB deletion failed.

Use draft/pending status; allow creator to submit for review and admin to publish. Do not let a creator change creator_id or set published directly. Reject invalid protocols for external links (allow http/https), negative/unreasonable years, blank titles, invalid images. Limit images to JPEG/PNG/WebP and 5 MB at client and bucket configuration.

Exit: create with image, reload, edit, delete, forbidden mutation and failed-upload paths verified.

## M3 — public content and moderation (estimate 2 hours)

Build teacher list/details, events/details/albums, history and creator profiles. Import curated data after checking docs/reference/teacher-research.md; it is previous conversation research, not verified current data. Some photos and course fields are missing. Use explicit temporary fallback UI while collecting required assets. Missing teacher photos remain a delivery gap, not a completed requirement.

Use one lean admin screen with tabs for exhibit moderation and teacher/event/history/category management. Ordinary users cannot invoke admin operations through direct API requests. Public content must be explicitly published where drafts are supported.

Exit: all required content types present, navigation/direct links work, event-photo relationship correct, public-release permissions recorded in docs/CONTENT.md.

## M4 — search and Technology Evolution (estimate 1–1.5 hours)

Search title case-insensitively; combine year/category/technology filters; include reset/no-results states. Preserve filters in URL query parameters so drill-down links and browser Back behave sensibly.

Evolution reads published exhibits only: (a) ordered year selector/timeline; (b) per-year tech counts using unique normalized names within each exhibit; (c) two-year comparison on the union of technologies; (d) click tech/year to open filtered works. Exclude null years from comparison with explicit UI handling. Show count of exhibits, not global tech-market percentages. Include a small table for accessibility and explain multi-technology totals.

Do not use fabricated chart arrays separate from DB records. Fetch all relevant rows or implement server aggregation/pagination; Supabase result limits must not silently truncate the chart. Initial small dataset allows client aggregation. Test duplicate tags, case/whitespace, unpublished entries, empty years and overlapping tech sets.

## M5 — verification, deployment and handover (estimate 2 hours)

Run checks and TESTS acceptance scenarios. Tune 360px/tablet/desktop, visible focus, labelled inputs, contrast, error/empty/loading states. Deploy Vite dist on a separate Vercel project and configure Supabase auth URLs. Verify nested URL refresh, image permissions, signup and RLS on deployed URL. Add exact commands, ERD, wireframes, screenshots, content attribution and demo script to README/docs.

## Schedule and trade-offs

Museum receives roughly 9–11 focused hours; actual progress decides the order. Resolve Auth/RLS early. Start deployment setup early enough to uncover redirects and env issues, but don't publish private research. Complete StudyMate separately. Reserve final 2–3 hours for cross-project checks/delivery.

If late: reduce seed volume, animation, elaborate cards and decorative charts. Never cut RLS, image storage, auth, CRUD, required content types or Technology Evolution. Do not add real AI, 3D galleries, chat, notifications or unrelated dashboards.

## Per-phase completion report

State requirement IDs completed; changed files; commands and actual results; manual scenarios passed/not run; remaining blockers; next phase. Update STATUS first. Student should be able to explain props/state/events, PK/FK, auth vs authorization, RLS, and technology aggregation.
