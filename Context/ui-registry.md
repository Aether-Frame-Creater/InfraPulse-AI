# UI Registry — InfraPulse AI

Living registry. Record components only after confirming they exist in the repository. This initial file is a template, not proof of implementation.

## Rules
1. Inspect the current component library and design system before adding a new component.
2. Reuse existing components and tokens where possible.
3. Follow `ui-rules.md` and `ui-tokens.md`, reconciled with the actual repo.
4. Do not claim a component is implemented until its source path and verification are known.
5. Update this registry when reusable UI is added or changed.

## Registry
| Component | Status | Actual path | Variants/states | Tests/verification |
|---|---|---|---|---|
| Application shell/navigation | Not verified | Confirm from repo | Loading, authenticated, signed out, responsive | Pending |
| Button/action component | Not verified | Confirm from repo | Primary, secondary, destructive, disabled, loading | Pending |
| Form field/input | Not verified | Confirm from repo | Default, focus, invalid, disabled | Pending |
| Async state component | Not verified | Confirm from repo | Loading, empty, error, populated | Pending |
| Confirmation dialog | Not verified | Confirm from repo | Confirm, cancel, busy | Pending |
| Notification/toast | Not verified | Confirm from repo | Success, info, warning, error | Pending |
| Map/location component | Not verified | Confirm from repo | Permission denied, loading, no result, provider error | Pending |
| Email status component | Not verified | Confirm from repo | Queued/accepted, failed, retryable | Pending |

## Component Update Template
- Name:
- Status and date verified:
- Actual source path:
- Purpose and public props:
- Tokens/design-system components used:
- Responsive behavior:
- Loading/empty/error/disabled states:
- Accessibility:
- Tests/manual verification:
- Notes:
