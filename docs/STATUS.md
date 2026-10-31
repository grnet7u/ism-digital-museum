# Status — 2026-11-01

Owner: Claude Code. Codex prepared the environment; Codex will now own the separate StudyMate project.

## Completed (M0 scaffold)
- Independent Vite React/JavaScript folder, npm install and lockfile, Node 24 engine.
- Supabase SDK and React Router installed; missing-config guard, simple UFE-styled route shell.
- Technology aggregation utility with focused tests; not a complete Evolution UI.
- Local VS Code tasks/recommendations; existing global settings untouched.
- Vercel SPA config and detailed deployment instructions.
- PLAN, architecture/security, design/wireframe, content, tests and Claude starting prompt.
- Assignment PDF/design image/previous teacher research copied as ignored local reference.
- Separate local Git repository; no remote/cloud resources created.

## Verified
2026-11-01: npm run check PASS (oxlint, 2 Vitest cases, Vite production build).
Initial online npm audit: 0 reported vulnerabilities. No real Supabase or browser end-to-end tests run.
Node v24.21.0; npm 11.19.1; Git 2.55.0.windows.5.

## Remaining / not claimed
M1–M5 are NOT complete. Auth, RLS, storage, CRUD, real pages/admin/evolution UI, approved content and deployment remain. Reference photo/permission/content gaps documented in CONTENT. No live URL, GitHub remote or Supabase project configured.

## Next action
Claude: read CLAUDE.md and start M1. Identify the correct Supabase project without guessing or requesting secrets in chat. If account setup is unavailable, build independent page/form components and tests, but leave database acceptance explicitly pending. Keep the mobile repo untouched.
