# Independent web deployment

Target: separate GitHub repository `ism-digital-museum`, separate Vercel project, one dedicated Supabase project. No cloud project or remote exists merely because this file exists.

## Local

Node 24 (prepared with 24.21.0), npm, Git. `npm ci`, copy `.env.example` to `.env.local`, fill Supabase URL/publishable key in editor, `npm run dev`. Missing values show a clear setup state; do not claim a database connection.

## Supabase prerequisite

Select correct organization/project; schema, RLS, storage and reviewed seed data must be applied and tested. Configure email confirmation and local/production auth redirect URLs intentionally. Do not disable verification merely to hide a broken flow. Set admin role through trusted backend; refresh session. Record project reference and migration state, never passwords or secret keys.

## Vercel

1. Push only this repository to its own GitHub remote; review staged files first.
2. Import that repository. Framework Vite; root `.`; install `npm ci`; build `npm run build`; output `dist`; Node 24.x.
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` for intended preview/production environments. VITE variables are browser-visible, so no secrets.
4. `vercel.json` supplies SPA route fallback. Build locally with `npm run check` first.
5. Configure Supabase Site URL and allowed callback URLs for actual deployment and localhost. Rebuild if env values change.
6. Verify nested-route refresh, signup/login/logout, Storage and RLS on deployed URL. Ensure assignment reviewer can access public demo without Vercel login protection.

No custom domain, server, CI deploy token or paid service is needed for this scaffold. Git integration is sufficient. Netlify is an allowed assignment alternative, but do not maintain two hosting pipelines.

Rollback frontend to known-good deployment if needed. Database changes require their own reviewed rollback or forward fix; reverting frontend does not revert DB. Never delete a production table to repair demo data.

Official references checked during preparation: https://vite.dev/guide/ ; https://vercel.com/docs/frameworks/frontend/vite ; https://supabase.com/docs/guides/getting-started/tutorials/with-react ; https://supabase.com/docs/guides/storage/security/access-control . Read current docs before changing SDK APIs.
