# T-13: Status email templates

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | M | [02](../../specs/02-organization-approval.md) | [T-02](../00-cross-cutting/T-02-env-config-and-cache-tags.md) |

- New templates in `features/email/templates/`, each exported from `features/email/server.ts`:
  - `organizationRequestEmail`
  - `organizationApprovedEmail` (the activation email)
  - `organizationRejectedEmail`
  - `organizationSuspendedEmail`
  - `organizationReactivatedEmail`
- Each has a text and an HTML version and goes through `escapeHtml`.
- Add a `sendToOwners(organizationId, email)` helper, which logs failures and never throws.

**Done when**
- [ ] Every template renders in the dev mail catcher with correct links, and user-supplied names and reasons are escaped.
