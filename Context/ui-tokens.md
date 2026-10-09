# UI Tokens — InfraPulse AI

**Status: provisional.** These tokens are a neutral starting point only, not a confirmed InfraPulse AI brand system. Inspect the repository's existing CSS variables, Tailwind theme, component library, and mobile theme before applying or replacing tokens. Existing project tokens take precedence.

## Design Direction
Clear, trustworthy, data-oriented, accessible, and restrained. Avoid decorative effects that reduce readability or slow down core workflows.

## Provisional Color Tokens
| Token | Value | Intended use |
|---|---|---|
| `background` | `#F8FAFC` | Main page background |
| `surface` | `#FFFFFF` | Cards and panels |
| `surfaceMuted` | `#F1F5F9` | Secondary surfaces |
| `primary` | `#1D4ED8` | Primary actions and emphasis |
| `primarySoft` | `#DBEAFE` | Selected/soft primary surface |
| `accent` | `#0F766E` | Secondary emphasis, if consistent with brand |
| `textPrimary` | `#0F172A` | Main text |
| `textSecondary` | `#475569` | Supporting text |
| `border` | `#E2E8F0` | Borders and separators |
| `success` | `#15803D` | Success status |
| `warning` | `#B45309` | Warning status |
| `error` | `#B91C1C` | Error status |
| `info` | `#1D4ED8` | Informational status |

Use the repository's existing tokens instead if present. Verify contrast for foreground/background pairs; do not apply color as the only status indicator.

## Typography
- Use the existing configured font if the repository has one.
- Prefer a clear hierarchy for page titles, section headings, body text, and supporting labels.
- Respect browser/mobile text scaling; avoid fixed-height text containers that clip content.

## Spacing and Shape
- Reuse the project's spacing, radius, and component conventions.
- If no system exists, start with a consistent 4/8/12/16/24/32 spacing scale.
- Use consistent radii for controls, cards, and dialogs.
- Keep borders and elevation subtle.

## Component Invariants
- Define tokens centrally (CSS variables/Tailwind theme or the mobile theme system actually used).
- Avoid ad-hoc hardcoded values when shared tokens exist.
- Keep focus indicators visible.
- Verify contrast, keyboard focus, touch targets, and responsive behavior before release.
