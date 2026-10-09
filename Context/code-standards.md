# Code Standards — InfraPulse AI

## Engineering Workflow
- Read `project-overview.md`, `architecture.md`, the relevant `build-plan.md` section, and `library-docs.md` before implementation.
- Inspect existing patterns and follow the repository's package manager, lint rules, naming, and folder conventions.
- Prefer small, reviewable changes.
- Never claim success before the backend/provider confirms it.
- Update `progress-tracker.md` after verified milestones and `ui-registry.md` after changing reusable UI.
- Keep all normal development changes on `dev`, commit each focused change, and push to the configured GitHub remote when available.

## TypeScript / Next.js
- Use strict TypeScript settings where the project enables them; avoid `any` and validate external data at runtime.
- Follow existing App Router/Pages Router conventions rather than mixing routing models.
- Keep server-only modules and secrets out of client components/bundles.
- Use server components by default where appropriate; add client components only for required interactivity.
- Validate request bodies, query parameters, route params, and environment variables.
- Return safe, consistent errors; do not expose stack traces or provider payloads to clients.
- Use the project's configured formatter, lint, typecheck, build, and test scripts.

## Expo / React Native (if present)
- Follow the existing Expo SDK and React Native versions.
- Keep secret-bearing operations on a trusted server.
- Handle offline/network/permission failures explicitly.
- Keep UI behavior accessible and test on supported platforms.
- Do not add mobile-specific architecture if mobile is not part of this repository's scope.

## Clerk Authentication
- Verify sessions in protected server routes/actions and API handlers.
- Use Clerk's current supported server APIs for the installed version.
- Authentication answers “who is signed in”; authorization must separately answer “may this user access this resource?”
- Never accept a client-provided user ID as proof of identity.
- Test unauthenticated and unauthorized access paths.

## Supabase and Database
- Use migrations for schema changes when Supabase migrations are part of the project.
- Enable RLS on tables exposed to client-accessible Supabase APIs.
- Policies must verify the appropriate user/resource relationship.
- Never ship the service-role key to web/mobile clients.
- Validate and authorize writes on the server or in secure database policies/functions.
- Add constraints and indexes for important invariants and common queries.
- Treat transaction and retry behavior deliberately for multi-row operations.

## Google SMTP
- SMTP connections must be made only by trusted server-side code.
- Keep app passwords/OAuth credentials in secret environment configuration; never commit them.
- Validate sender configuration, recipient, allowed message type, and caller authorization.
- Prefer server-generated templates and data over arbitrary client-supplied email bodies.
- Apply rate limits and safe retry/idempotency rules.
- Do not log credentials, tokens, full email content, or unnecessary personal data.
- Distinguish “accepted/queued by SMTP” from confirmed inbox delivery.

## Google Maps
- Restrict keys to required APIs and appropriate web/mobile application origins.
- Keep private/server keys server-side.
- Validate coordinates and handle permission denial and provider errors.
- Do not expose internal provider responses or use location as an authorization boundary.

## Testing
- Add tests for changed business logic and error paths.
- Test authorization boundaries and invalid inputs, not only happy paths.
- Use non-production data in tests.
- Record exact commands and outcomes; if a check cannot run, state why.
- Do not mark a feature complete based only on its UI existing.

## Git and Secrets
- Branch: `dev`.
- Before edits: inspect `git status`; preserve unrelated changes.
- After edits: review `git diff`, run relevant checks, update context, commit, and push.
- Never commit `.env`, credentials, SMTP app passwords, Clerk secret keys, Supabase service-role keys, private Maps keys, tokens, or real user data.
- Keep `.env.example` to placeholder names/values only.
- Do not force-push or rewrite history without explicit authorization.
