# Build Plan — InfraPulse AI

## Working Rules
- Inspect the current repository and current branch before starting.
- Build one end-to-end slice at a time.
- Update `progress-tracker.md` only after testing the relevant workflow.
- Keep the product scope grounded in the existing README/requirements; do not invent modules.
- All work should happen on Git branch `dev` unless the repository owner explicitly chooses another workflow.

## Phase 0 — Repository Baseline
- [ ] Clone/open `https://github.com/Aether-Frame-Creater/InfraPulse-AI`.
- [ ] Inspect README, package manifests, lockfiles, app routes, mobile workspace (if any), Supabase configuration, and existing tests.
- [ ] Confirm the repository's actual product purpose, roles, workflows, and folder layout.
- [ ] Check current branch and working tree; preserve unrelated user changes.
- [ ] Create/switch to `dev` from the appropriate base branch; do not overwrite an existing remote branch.
- [ ] Identify package manager from lockfile and use the existing one.
- [ ] Run baseline lint, typecheck, build, and tests where configured; record exact results.
- [ ] Add/verify `.env.example` with variable names only, never secret values.

## Phase 1 — Application Foundation
- [ ] Confirm web/mobile scope and supported platforms.
- [ ] Document actual route and component architecture.
- [ ] Verify responsive layout, accessibility, loading/error/empty states, and shared design tokens.
- [ ] Confirm environment validation and safe error handling.

## Phase 2 — Authentication and Authorization
- [ ] Verify Clerk configuration and sign-in/sign-up/session handling.
- [ ] Protect server routes and APIs.
- [ ] Define roles/resource ownership from actual product requirements.
- [ ] Add and test Supabase RLS policies for exposed tables, if Supabase is used.
- [ ] Test unauthenticated, unauthorized, expired-session, and cross-user access cases.

## Phase 3 — Core Product Workflows
- [ ] Derive feature order from repository requirements and current implementation.
- [ ] For each workflow: UI/state, server validation, persistence, authorization, error handling, tests, and documentation.
- [ ] Use Supabase migrations for schema changes where applicable.
- [ ] Do not mark UI-only work as end-to-end complete.

## Phase 4 — Google Maps (when required)
- [ ] Confirm exact APIs needed by the product.
- [ ] Configure restricted API keys and environment variables.
- [ ] Implement map/location UI and permission-denied/API-error states.
- [ ] Test invalid coordinates, empty results, denied permissions, and API failures.

## Phase 5 — Google SMTP
- [ ] Select the approved sender account and confirm Gmail SMTP vs Workspace SMTP relay.
- [ ] Store SMTP host/port/user/password or app password only in server secrets.
- [ ] Implement a narrow server-side email service with approved templates.
- [ ] Validate recipient, caller authorization, allowed email type, and rate limits.
- [ ] Record safe delivery status and provider error category without secrets or full message bodies.
- [ ] Configure Supabase Auth SMTP separately if custom auth emails are needed.
- [ ] Test invalid recipient, auth failure, rate limit, timeout, retry, and duplicate-send prevention.

## Phase 6 — Quality and Security
- [ ] Run the repository's formatter, lint, typecheck, build, and tests.
- [ ] Review secrets, authorization, RLS, dependency changes, and error messages.
- [ ] Test narrow mobile and desktop viewports if those targets exist.
- [ ] Update `progress-tracker.md`, `ui-registry.md` when applicable, and relevant docs.

## Phase 7 — GitHub Delivery (required for each change)
1. `git status --short --branch`
2. Switch to `dev` safely; create it from the agreed base only if it does not exist.
3. Implement a focused change.
4. Run relevant checks and inspect `git diff`.
5. Update context files and progress notes.
6. Commit with a clear message, e.g. `docs: update InfraPulse AI context`.
7. Push with `git push -u origin dev` for the first push, then `git push origin dev`.
8. Record commit hash, checks run, and push result in `progress-tracker.md`.
9. Never claim a commit or push succeeded unless the command/provider confirms it.
10. Never force-push, discard user changes, commit secrets, or amend unrelated commits without explicit approval.

## Current Priority
Repository inspection and baseline verification come first. Product-specific implementation priorities cannot be responsibly fixed until the repository README and code have been inspected.
