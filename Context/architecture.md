# Architecture — InfraPulse AI

## Architecture Principles
- The repository is the source of truth for the exact app structure and product workflows.
- Use Next.js + TypeScript for the web application and Expo / React Native + TypeScript only where mobile scope exists in the repository.
- Clerk manages identity; backend authorization must still validate access to each resource.
- Supabase PostgreSQL is the data store where configured. Use RLS for exposed tables and server-side authorization for privileged actions.
- Google Maps is an integration for approved map/location use cases, not a general data store.
- Google SMTP is server-side only.
- Do not migrate frameworks or replace libraries simply to match this context file; reconcile the file with the existing repository first.

## Confirmed Stack (verify versions against lockfiles)
| Layer | Technology | Responsibility |
|---|---|---|
| Web | Next.js + TypeScript | Web routes, UI, server-side handlers |
| Mobile | Expo / React Native + TypeScript, if present | Mobile client |
| Authentication | Clerk | Identity, sessions, sign-in/sign-up |
| Database | Supabase PostgreSQL, if configured | Persistent relational application data |
| Authorization | Supabase RLS + server-side checks | Resource and tenant access control |
| Maps | Google Maps Platform, where required | Maps, geocoding, or location workflows |
| Email | Google SMTP | Transactional/application email from trusted backend |
| Source control | Git + GitHub | Branching, review, history, collaboration |

## Logical Architecture
```text
Web client (Next.js)            Mobile client (Expo, if in scope)
        |                                  |
        +----------- Clerk sessions -------+
                         |
             Trusted server boundary
        (Next.js server routes/actions or
          configured backend functions)
             |           |           |
          Supabase    Google Maps   Google SMTP
          PostgreSQL  APIs          SMTP relay
             |
       RLS + constraints + migrations
```

## Security Boundaries
- Client code may contain only public, appropriately restricted configuration.
- Never expose Clerk secret keys, Supabase service-role keys, SMTP credentials/app passwords, private Maps keys, or other server secrets.
- Verify the Clerk session on every protected server request.
- Validate resource ownership/role before reads and writes.
- RLS must protect tables exposed through Supabase APIs; do not rely on UI hiding.
- Validate and normalize user input on the server.
- Do not log tokens, passwords, full email bodies, or unnecessary personal data.
- Use idempotency protection for retryable operations that can cause duplicate side effects.

## Repository Structure
Do not impose a new structure before inspecting the repository. Record actual folders here after review. A common shape, only if compatible with the current repo:
```text
apps/
  web/          # Next.js app, if monorepo
  mobile/       # Expo app, if monorepo
packages/       # shared types/UI, if present
supabase/
  migrations/
  functions/    # only if used
context/
  project-overview.md
  architecture.md
  build-plan.md
  code-standards.md
  library-docs.md
  progress-tracker.md
  ui-registry.md
  ui-rules.md
  ui-tokens.md
```

## Integration Notes
### Google SMTP
- Send email only from trusted server-side code.
- Keep SMTP credentials in deployment/server secret storage and local untracked environment files.
- Standard Gmail SMTP commonly uses `smtp.gmail.com` with port `587` + STARTTLS or `465` + TLS; verify account eligibility and current Google guidance before implementation.
- Gmail app passwords require eligible account security configuration; Workspace SMTP relay may be appropriate for managed organizations.
- Handle authentication errors, invalid recipients, rate limits, and transient failures safely.
- Track status only as accurately as the provider allows; SMTP acceptance is not proof that the message reached the inbox.

### Google Maps
- Enable only the APIs required by actual features.
- Apply API-key restrictions and quotas.
- Do not treat geocoding output as proof of a user's exact location or as authorization.
- Handle denied location permissions and unavailable network/API responses.

### Supabase
- Use migrations for schema changes.
- Enable RLS on client-exposed tables.
- Keep privileged keys and administrative mutations server-side.
- Use transactions/constraints for multi-row invariants.
