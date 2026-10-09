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
- **Supabase is not set up.** No project exists and no credentials are configured, so schema migrations and RLS policies cannot be written or verified yet. This blocks multi-tenant isolation and persistence.
- **Clerk Organizations are unavailable on the temporary keys.** `GET /v1/organizations` returns 403 on the accountless dev instance, so per-org isolation cannot be built or tested until the app is claimed and Organizations are enabled.
- **User roles are still undefined.** Multi-tenant per-org isolation was chosen as the model, but the specific roles inside an org (owner/admin/member) have not been fixed. These must be settled before RLS policies are written.
- No product module beyond the uptime check engine has been specified.

## Decisions
- **Product domain:** infrastructure monitoring.
- **Tenancy:** multi-tenant with per-org isolation. Clerk Organizations is the intended tenant boundary.
- **First feature:** uptime checks.
- **Supabase is deferred, not abandoned.** Postgres suits users, targets, alert rules, and incidents. Raw metric samples are time-series data and are a poor fit for plain Postgres rows; **TimescaleDB is a Postgres extension and can live in the same Supabase project**, so the stack and vendor do not need to change. Confirm before writing metric-sample migrations.
- **Uptime checks are inherently an SSRF vector**: they make the server fetch a user-supplied URL, which in an infrastructure-monitoring product normally points at internal addresses. The mitigation is that only authenticated, org-scoped users may create targets and the service-role key stays server-side. Revisit if targets become user-editable without org scoping.

## Change Log
### Uptime check engine
- Date: 2026-10-09
- Branch: `dev`
- Feature/change: Added the uptime check engine — a single reachability probe that returns a persistable, display-safe result. This is the core of the agreed first feature. No persistence, scheduling, or UI yet.
- Files changed: `src/lib/uptime/check-target.ts`, `tests/uptime/check-target.test.ts`, `Context/progress-tracker.md`.
- Tests/checks run: `npm test` (23/23 pass), `npm run lint` (clean), `npm run typecheck` (clean), `npm run build` (succeeds).
- Results: Verified against a **real local HTTP server**, not mocks — covering 200, 404, 500, redirect following, connection refused, timeout, and invalid URL.
- Security/authorization checks: Network failures are mapped to a fixed set of categories (`dns`, `tls`, `timeout`, `connection_refused`, `unreachable`, `http_error`, `invalid_url`) rather than raw error messages, because a raw message can leak internal hostnames and ports into the database and UI. A test asserts the category is always a known value. Only `http`/`https` are probeable. Credentials are never sent to monitored hosts.
- Commit hash: Recorded below after commit.
- Push result: Recorded below after push.
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