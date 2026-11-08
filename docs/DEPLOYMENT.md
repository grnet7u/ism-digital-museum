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

### Exact values for this project (student deploys manually)

| Where | Setting | Value |
|---|---|---|
| GitHub | new repo | `ism-digital-museum` (empty, no README); `git remote add origin <url>` then `git push -u origin main` |
| Vercel → Import | Framework / Root / Build / Output | Vite / `./` / `npm run build` / `dist` (also in `vercel.json`) |
| Vercel → Environment Variables | `VITE_SUPABASE_URL` | `https://csggzcpmjisspzkxrhky.supabase.co` |
| Vercel → Environment Variables | `VITE_SUPABASE_PUBLISHABLE_KEY` | same publishable key as `.env.local` (never the secret key) |
| Vercel → Settings → Deployment Protection | Vercel Authentication | Off for Production, so the reviewer opens it without logging in |
| Supabase → Authentication → URL Configuration | Site URL | `https://<vercel-domain>` |
| Supabase → Authentication → URL Configuration | Redirect URLs (add, keep local ones) | `https://<vercel-domain>/auth/callback` |
| `supabase/config.toml` | `site_url`, `additional_redirect_urls` | mirror the dashboard values and commit (dashboard is the source of truth for the hosted project) |

Post-deploy checks: open `/exhibits?year=2025` and `/events/<id>` directly and press refresh (SPA fallback); images load signed-out; `/evolution` drill-down; log in with the admin demo account; `/admin` refused for creator A. Optional: `npm run rls-check` is URL-independent (it talks to Supabase), so its local result already covers RLS. Default Supabase SMTP only mails org members and is rate-limited, so test signup with your own address or demo with prepared accounts.

No custom domain, server, CI deploy token or paid service is needed for this scaffold. Git integration is sufficient. Netlify is an allowed assignment alternative, but do not maintain two hosting pipelines.

Rollback frontend to known-good deployment if needed. Database changes require their own reviewed rollback or forward fix; reverting frontend does not revert DB. Never delete a production table to repair demo data.

Official references checked during preparation: https://vite.dev/guide/ ; https://vercel.com/docs/frameworks/frontend/vite ; https://supabase.com/docs/guides/getting-started/tutorials/with-react ; https://supabase.com/docs/guides/storage/security/access-control . Read current docs before changing SDK APIs.
