# Progress Tracker — InfraPulse AI

Update this file after each verified implementation milestone. Documentation updates alone do not mean an application feature is implemented.

## Current Status
- **Project:** InfraPulse AI
- **Repository:** https://github.com/Aether-Frame-Creater/InfraPulse-AI
- **Product domain (confirmed by owner):** Infrastructure monitoring.
- **Working branch:** `dev` (created from `main`; see Change Log)
- **Email:** Google SMTP, server-side only (not implemented yet)
- **Current phase:** Phase 1/2 — Application foundation and authentication are scaffolded and verified.
- **Feature implementation status:** Auth shell is implemented and verified. No product features (monitoring, metrics, alerting) exist yet.
- **Repository baseline:** The GitHub repository was **empty** on 2026-10-09 (confirmed by a clone that reported an empty repository). All code in this folder is new.

## Milestones
- [x] Inspect repository README, code, manifests, lockfiles, and requirements. (Repository was empty; baseline established from scratch.)
- [x] Confirm exact product purpose, user roles, and MVP workflows. (Domain confirmed as infrastructure monitoring. **Roles still open** — see Open Questions.)
- [x] Inspect current Git branch, remotes, and uncommitted changes. (Repository had no commits; initialized locally.)
- [x] Create/switch to `dev` safely and confirm remote tracking. (`main` committed first, then `dev` branched from it; both pushed and tracking confirmed.)
- [x] Run baseline lint/typecheck/build/tests available in repository.
- [x] Verify Clerk auth and server-side authorization.
- [ ] Verify Supabase schema/RLS/migrations if Supabase is configured. (Not configured yet.)
- [ ] Implement and test confirmed core workflows.
- [ ] Implement Google Maps features only where required.
- [ ] Implement Google SMTP server-side mail delivery.
- [ ] Complete security and deployment checks.

## Project Decisions
- Web: Next.js 16.4.0 + TypeScript (App Router, `src/` directory).
- Authentication: Clerk 7.9.13.
- Database: Supabase PostgreSQL where configured; RLS required for exposed tables. (Not started.)
- Maps: Google Maps Platform where product workflows need it. (Not started.)
- Email: Google SMTP, called from trusted server-side code only. (Not started.)
- GitHub repository: `https://github.com/Aether-Frame-Creater/InfraPulse-AI`
- Development branch: `dev`; every focused change should be committed and pushed after verification.

## Verified Environment Facts
These were confirmed by reading the installed packages, not assumed:

- **Next.js 16 renamed `middleware.ts` to `proxy.ts`.** The export must be named `proxy` and the runtime defaults to Node.js. `middleware` is deprecated. This project uses `src/proxy.ts`.
- Clerk 7.9.13 declares peer support for `^16.0.10 || ^16.1.0-0` and detects Next 16 at runtime, so `clerkMiddleware()` works unchanged in the `proxy.ts` convention.
- `create-next-app` scaffolds with `cacheComponents: true` and `partialPrefetching: true`.
- Because `cacheComponents` is on, a route that reads the session cookie cannot be prerendered. `/dashboard` therefore exports `instant = false` to block on the server, and the Clerk sign-in/sign-up components are wrapped in `<Suspense>` because they read `usePathname()`.
- With partial prerendering, an unauthenticated request to `/dashboard` returns HTTP 200 with a streamed shell and performs the redirect **client-side**. Curl alone cannot verify this; a real browser is required.

## Open Questions
- **Clerk Organizations are still not enabled.** `clerk auth login` succeeded and the instance is now claimed to a workspace (`workspace_id` is present), but `GET /v1/organizations` still returns **403**. Enabling Organizations is a separate switch in the Clerk dashboard. Per-org isolation is blocked until it is on.
- **Supabase REST is not serving yet.** The project URL and publishable key are valid (`/auth/v1/health` returns 200, GoTrue v2.197.0), but `/rest/v1/` returns **401** with every header combination tried. A newly created project needs time before PostgREST becomes healthy. Retry before assuming it is broken.
- **`SUPABASE_SERVICE_ROLE_KEY` is still missing.** Needed for privileged writes and for applying migrations.
- **Roles within an organization are undefined.** Tenant isolation is decided; the in-org roles (owner/admin/member) are not. The current policies let any org member edit any target, which is almost certainly too permissive. This must be tightened before go-live.
- **The Clerk/Supabase JWT verification question is unresolved.** See Decisions.

## Decisions
- **Product domain:** infrastructure monitoring.
- **Tenancy:** multi-tenant with per-org isolation. Clerk Organizations is the intended tenant boundary.
- **First feature:** uptime checks.
- **Supabase is deferred, not abandoned.** Postgres suits users, targets, alert rules, and incidents. Raw metric samples are time-series data and are a poor fit for plain Postgres rows; **TimescaleDB is a Postgres extension and can live in the same Supabase project**, so the stack and vendor do not need to change. Confirm before writing metric-sample migrations.
- **RLS alone cannot carry Clerk authz against PostgREST.** A Clerk token is signed by Clerk, not Supabase, so PostgREST will reject it unless the Supabase JWT secret/JWKS is pointed at Clerk. The safer default is to keep all database access on the server via the service-role key and enforce org scoping in application code, with RLS retained as defence in depth. This is unresolved and needs a decision before client-side data access is built.
- **Uptime checks are inherently an SSRF vector**: they make the server fetch a user-supplied URL, which in an infrastructure-monitoring product normally points at internal addresses. The mitigation is that only authenticated, org-scoped users may create targets and the service-role key stays server-side. Revisit if targets become user-editable without org scoping.

## Change Log
### Supabase schema and RLS policies (written, NOT applied)
- Date: 2026-10-09
- Branch: `dev`
- Feature/change: Wrote the initial migration for `targets` and `uptime_checks`, with per-org Row Level Security and a `has_org_access` helper that understands Clerk's `org_id` and `org_ids` claims. Added the real Supabase variable names to `.env.example`.
- Files changed: `supabase/migrations/20261009120000_initial_schema.sql`, `.env.example`, `Context/progress-tracker.md`.
- Tests/checks run: **No database tests were run, because the database is not reachable yet.** The SQL has never been executed. Lint, typecheck, and build are unaffected (no application code changed) and remain green from the previous commit.
- Results: None. This is unexecuted SQL and must be treated as a draft.
- Security/authorization checks: RLS enabled on both tables with org-scoped policies. `anon` is revoked on both. Deliberately **no INSERT/UPDATE/DELETE policy on `uptime_checks`**, so probe results can only be written by the service-role path and a compromised client token cannot fabricate healthy history. A check constraint enforces that `status = 'up'` cannot carry an error category.
- Commit hash: recorded in git history; see `git log`.
- Push result: see `git log`.
- Known limitations:
  - **Completely unverified.** Never executed against Postgres. Syntax, constraint behaviour, and policy semantics are all unproven.
  - The in-org role model is not implemented, so any org member can currently edit any target.
  - The Clerk claim shape assumed by `has_org_access` cannot be confirmed until Organizations are enabled and a real token can be issued.
- Next step: Wait for PostgREST to become healthy, add the service-role key to `.env.local`, then apply this migration and test the policies with a real token.
### Uptime check engine
- Date: 2026-10-09
- Branch: `dev`
- Feature/change: Added the uptime check engine — a single reachability probe that returns a persistable, display-safe result. This is the core of the agreed first feature. No persistence, scheduling, or UI yet.
- Files changed: `src/lib/uptime/check-target.ts`, `tests/uptime/check-target.test.ts`, `Context/progress-tracker.md`.
- Tests/checks run: `npm test` (23/23 pass), `npm run lint` (clean), `npm run typecheck` (clean), `npm run build` (succeeds).
- Results: Verified against a **real local HTTP server**, not mocks — covering 200, 404, 500, redirect following, connection refused, timeout, and invalid URL.
- Security/authorization checks: Network failures are mapped to a fixed set of categories (`dns`, `tls`, `timeout`, `connection_refused`, `unreachable`, `http_error`, `invalid_url`) rather than raw error messages, because a raw message can leak internal hostnames and ports into the database and UI. A test asserts the category is always a known value. Only `http`/`https` are probeable. Credentials are never sent to monitored hosts.
- Commit hash: `4de2e0666feedba827c5d77ec9db545b72e67ec2` (feature commit; the follow-up that records this hash is a separate docs commit).
- Push result: **Confirmed.** `git ls-remote --heads origin dev` reports `4de2e06`.
- Known limitations:
  - **Not end-to-end.** No persistence, no scheduler, no UI. Per the build plan, this must not be called a completed feature.
  - A bug was caught by these tests: Node's fetch reports an abort as `name: "AbortError"` with numeric `code: 20`, not the string `"ABORT_ERR"`, so the first classifier returned `unknown` for timeouts. Fixed, and the code now treats `controller.signal.aborted` as the authoritative timeout signal so it does not depend on error shape across Node versions.
  - Redirects are followed and the final status recorded; there is no redirect-loop or max-hop guard beyond the request timeout.
- Next step: Claim the Clerk app and enable Organizations, and create the Supabase project. Then define roles within an org and write the schema with RLS policies.

### Auth shell and application foundation
- Date: 2026-10-09
- Branch: `dev` (from `main`)
- Feature/change: Scaffolded the Next.js application, wired Clerk authentication with a Next 16 `proxy.ts`, added sign-in/sign-up pages and a protected dashboard, added env template and unit tests.
- Files changed: Full project scaffold; `src/proxy.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/sign-in/**`, `src/app/sign-up/**`, `src/lib/clerk-env.ts`, `src/components/clerk-not-configured.tsx`, `tests/clerk-env.test.ts`, `.env.example`, `tsconfig.json`, `package.json`.
- Tests/checks run: `npm run lint` (clean), `npm run typecheck` (clean), `npm test` (9/9 pass), `npm run build` (succeeds).
- Results: Build produces `/` (static), `/dashboard` (dynamic), and partial-prerendered sign-in/sign-up. `/dashboard` correctly marked `ƒ (Dynamic)`.
- Security/authorization checks: Unauthenticated browser request to `/dashboard` and `/dashboard/deep/nested` was confirmed to land on `/sign-in?redirect_url=...`, so the protected route does not leak content. Authorization is enforced **in the page as well as the proxy**, because a matcher is not a security boundary. Secrets are only read from server env; `.env.local` is git-ignored and `.env.example` contains variable names only.
- Commit hash: `fc3e84cb697ffa7b51c60576e2359ad5c8a6d328` on `main`, and `dev` created from it at the same commit.
- Push result: **Confirmed.** `git ls-remote --heads origin` shows both `refs/heads/main` and `refs/heads/dev` at `fc3e84c`. Both branches track their remote.
- Known limitations:
  - Clerk was provisioned with temporary **accountless development keys** (`.env.local`). Run `clerk auth login` to claim a real application before any deployment.
  - `npm audit` reports 5 high-severity advisories, all dev-only (transitive from `eslint-config-next` → `fast-glob` → `micromatch` → `braces`). They do not ship in the production bundle. The suggested fix is a **downgrade** of `eslint-config-next` to 14.x, so `npm audit fix --force` was deliberately **not** run.
  - Sign-in/sign-up flows were verified to render and to redirect, but a full sign-in through to the dashboard was not completed end-to-end.
- Next step: Configure git identity, commit on `main`, branch `dev`, push both. Then confirm user roles and design the Supabase schema and RLS.

### Context pack update
- Date: 2026-10-09
- Change: Replaced obsolete TailorStock/Flutter context with InfraPulse AI context and added Google SMTP plus GitHub `dev` workflow rules.
- Verification: Context documents generated locally. Repository push/branch creation has not been confirmed from this step.
- Commit hash: Pending GitHub access and repository verification.
- Tests: Not run; no application source code was modified in this context-pack generation.
- Next: Inspect repository, create/switch to `dev`, verify project facts, and commit this context pack.

## Entry Template
- Date:
- Branch:
- Feature/change:
- Files changed:
- Tests/checks run:
- Results:
- Security/authorization checks:
- Commit hash:
- Push result:
- Known limitations:
- Next step: