# Library and Integration Docs — InfraPulse AI

Check current official documentation and the versions installed in the repository before implementation. Prefer repository lockfiles and existing project decisions over generic snippets.

## Core Stack
- Next.js: https://nextjs.org/docs
- TypeScript: https://www.typescriptlang.org/docs/
- Expo: https://docs.expo.dev/
- React Native: https://reactnative.dev/docs/getting-started
- Clerk: https://clerk.com/docs
- Supabase: https://supabase.com/docs

## Clerk
- Docs: https://clerk.com/docs
- Use the current integration guide for the repository's Next.js or Expo version.
- Verify server sessions and protect backend routes.
- Do not confuse authentication with resource authorization.

## Supabase
- Docs: https://supabase.com/docs
- PostgreSQL: https://www.postgresql.org/docs/
- RLS: https://supabase.com/docs/guides/database/postgres/row-level-security
- Database migrations: https://supabase.com/docs/guides/deployment/database-migrations
- Edge Functions, if used: https://supabase.com/docs/guides/functions
- Keep service-role keys server-only and enable RLS on client-exposed tables.

## Google SMTP / Gmail
- Gmail SMTP and app passwords: https://support.google.com/mail/answer/185833
- Google Workspace SMTP relay: https://support.google.com/a/answer/2956491
- Supabase custom Auth SMTP: https://supabase.com/docs/guides/auth/auth-smtp
- Gmail API sending alternative/reference: https://developers.google.com/workspace/gmail/api/guides/sending

Project rules:
- Use Google SMTP for application email, as requested, through a server-only mailer.
- Common Gmail SMTP configuration is `smtp.gmail.com`, port `587` with STARTTLS or `465` with TLS; verify the chosen account and current Google requirements.
- App passwords require eligible account security configuration and may be unavailable for managed accounts. Consider Workspace SMTP relay where appropriate.
- Business email and Supabase Auth email are separate flows unless explicitly configured to share the same provider.
- SMTP credentials must be stored in deployment secrets or local ignored environment files.

## Google Maps Platform
- Platform overview: https://developers.google.com/maps
- Maps JavaScript API: https://developers.google.com/maps/documentation/javascript
- Places API: https://developers.google.com/maps/documentation/places/web-service
- Geocoding API: https://developers.google.com/maps/documentation/geocoding
- Enable only APIs used by confirmed product features and restrict keys by application/API.

## GitHub / Git
- Git documentation: https://git-scm.com/doc
- GitHub branch documentation: https://docs.github.com/en/get-started/using-git/about-branches
- GitHub pushing documentation: https://docs.github.com/en/get-started/using-git/pushing-commits-to-a-remote-repository
- Repository: https://github.com/Aether-Frame-Creater/InfraPulse-AI
- Development branch: `dev`.
- Each focused change should be committed and pushed to `dev` after checks. Record actual commit hash and push outcome; do not claim remote changes without confirmation.

## Repository-Specific Rule
This file records intended integrations, not proof that each provider is configured. Confirm actual package versions, API enablement, environment variables, redirect URLs, deployment secrets, and tests from the repository before implementing.
