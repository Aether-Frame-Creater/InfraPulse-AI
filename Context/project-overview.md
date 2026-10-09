# Project Overview — InfraPulse AI

## Project Identity
- **Project:** InfraPulse AI
- **Repository:** https://github.com/Aether-Frame-Creater/InfraPulse-AI
- **Development branch:** `dev`
- **Default workflow:** make project changes on `dev`, verify them, update context documents, then commit and push to GitHub.
- **Email provider:** Google SMTP (server-side only).

## Source-of-Truth Rule
The repository's current code, README, issues, and approved requirements are authoritative for the product's exact purpose and feature scope. The previous context pack described **TailorStock / Tailoring Materials Inventory** and is obsolete for this repository. Do not carry over its tailoring, inventory, POS, Flutter, Riverpod, GoRouter, or Material 3 assumptions unless the repository explicitly requires them.

The confirmed working assumptions in this context pack are:
- Web application: Next.js + TypeScript.
- Mobile application: Expo / React Native + TypeScript, where the repository confirms mobile scope.
- Authentication: Clerk.
- Database and backend services: Supabase (PostgreSQL; use RLS for exposed tables).
- Maps/location: Google Maps Platform where required by the product.
- Email: Google SMTP through trusted server-side code.
- Source control: Git and GitHub, repository above, development branch `dev`.

Before implementing product-specific features, inspect the repository and replace any unresolved scope notes with facts grounded in its README, source code, and accepted requirements.

## Product Scope
Confirmed by the project owner on 2026-10-09:
- **Product purpose:** Infrastructure monitoring — uptime, CPU and memory across servers and networks, surfacing what needs attention before it becomes an outage.
- **Primary users and roles:** NOT YET DEFINED. Assumption until confirmed: internal staff plus admin tiers. This must be settled before the Supabase schema and RLS policies are designed.
- **MVP workflows:** Only the authentication shell exists. No monitoring module (targets, metrics collection, alerting) has been specified.
- **Non-goals:** confirm from project requirements.

## Verified Stack
Confirmed by inspecting the installed packages on 2026-10-09:
- Next.js **16.4.0** (App Router, `src/` directory), React 19.3.0, TypeScript 5, Tailwind CSS v4.
- Clerk **7.9.13** for authentication.
- The GitHub repository was empty; this is a greenfield project.

### Next.js 16 conventions that differ from earlier versions
- **`middleware.ts` is deprecated and renamed to `proxy.ts`.** The export must be named `proxy` and the runtime defaults to Node.js. This project uses `src/proxy.ts`.
- The scaffold enables `cacheComponents` and `partialPrefetching`. Routes that read the session cookie cannot be prerendered; the dashboard exports `instant = false` to block on the server, and Clerk's auth components are wrapped in `<Suspense>`.
- Under partial prerendering, redirects can be delivered client-side with an HTTP 200. Behaviour that must be verified must be checked in a real browser, not with curl.

### Project-specific choices
- The app must degrade to a clear "authentication not configured" state when Clerk keys are absent, so the build stays verifiable in environments without secrets. `src/lib/clerk-env.ts` owns this decision and has unit tests.

## Engineering Principles
1. Inspect the current code before editing; preserve existing conventions and working features.
2. Implement small, testable changes rather than rewriting the project wholesale.
3. Keep secrets and privileged operations on the server.
4. Enforce authorization in backend/database policy, not only in UI routing.
5. Make loading, empty, error, and success states explicit.
6. Update this context pack whenever a project decision or implementation status changes.
7. Never mark a feature complete without verification evidence.
8. Every meaningful code/context change must be committed on `dev` and pushed to GitHub when credentials and remote access are available.

## Confirmed Integrations
### Clerk
Use Clerk for identity/session management according to the current repository configuration. Protect server routes and APIs as well as client routes. Do not trust client-supplied user IDs as authorization proof.

### Supabase
Use Supabase PostgreSQL as the relational data store where configured. Use migrations for schema changes and Row Level Security for client-accessible tables. Keep service-role credentials server-side only.

### Google Maps
Use Google Maps APIs only for the location/map workflows actually required by the product. Restrict API keys by application and API, and keep server-only keys out of client bundles. A browser/mobile-restricted public Maps key may be used only for APIs designed for client use.

### Google SMTP
Use Google SMTP for application emails through a trusted backend/server route or function. Never connect to SMTP directly from a browser or mobile client. Store credentials/app passwords in server-side environment secrets. Configure Supabase Auth email delivery separately if required; do not assume business email and authentication email use the same path.

## Definition of Done
- Scope matches repository requirements.
- TypeScript/lint/build/tests relevant to the change pass, or failures are documented.
- Authorization and error states are considered.
- No secrets or personal data are committed.
- Relevant context files and `progress-tracker.md` are updated.
- Changes are committed on `dev`; commit hash and push result are recorded honestly.
