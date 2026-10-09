# UI Rules — InfraPulse AI

These are baseline rules only. The existing repository design system, component library, and product requirements take precedence. Replace provisional rules with confirmed design decisions after inspecting the repository.

## Product Experience
- Prioritize clarity, predictable navigation, and fast completion of primary workflows.
- Use consistent terminology from the product requirements.
- Keep visible strings out of complex business logic and prepare for localization if required.
- Do not fabricate dashboard metrics or show fake zero values when data failed to load.
- Distinguish loading, empty, error, success, disabled, and permission-denied states.

## Layout and Navigation
- Follow the repository's existing responsive layout and routing conventions.
- Support narrow mobile screens and desktop layouts where those platforms are in scope.
- Respect safe areas, keyboard behavior, focus order, and system text scaling.
- Prefer a clear page title and one primary action per major workflow.
- Avoid excessive nested cards and unnecessary decoration.

## Forms and Actions
- Use persistent labels, appropriate input types, inline validation, and plain-language errors.
- Prevent duplicate submissions while writes are pending.
- Preserve user input when safe retries are possible.
- Confirm destructive or consequential operations.
- Show success only after the server confirms the operation succeeded.

## Data and Maps
- Do not use client-side UI state as an authorization boundary.
- Label units, dates, time zones, and currency consistently when relevant.
- Request location permission only when a feature needs it and explain the purpose.
- Handle denied location permission, missing results, and Google Maps API failures.
- Do not imply that a map marker or geocoded address proves identity or authorization.

## Email
- Display only a truthful status, such as queued, accepted by SMTP, or failed.
- Do not claim delivery to the recipient's inbox unless delivery confirmation is actually available.
- Never show SMTP passwords, raw provider responses, stack traces, or tokens.
- Provide a safe retry path only when duplicate sending is considered.

## Accessibility
- Use semantic labels for icon-only controls.
- Maintain readable contrast and adequate target sizes.
- Do not communicate status by color alone.
- Support keyboard navigation and screen readers on web; follow platform accessibility guidance on mobile.

## Do Not
- Do not hardcode arbitrary colors or spacing into individual components if a shared token system exists.
- Do not expose server secrets in browser or mobile bundles.
- Do not trust client-only role checks.
- Do not add product features that are not supported by repository requirements.
- Do not carry over TailorStock-specific UI or Flutter/Material 3 assumptions without confirmation.
