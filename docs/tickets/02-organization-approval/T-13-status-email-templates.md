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
- [x] Every template renders in the dev mail catcher with correct links, and user-supplied names and reasons are escaped.

**Notes**
- Each template has its own file (`organization-request.ts`, `organization-approved.ts`, `organization-rejected.ts`, `organization-suspended.ts`, `organization-reactivated.ts`). Links are built from `siteConfig.url`. The rejected and suspended emails name `siteConfig.supportEmail`.
- `organizationApprovedEmail` takes `planName`, which T-15 passes from the chosen plan.
- `sendToOwners` (`features/email/services/send-to-owners.ts`) reads owners fresh with Prisma, with no cache. It matches the exact `owner` key in the comma-separated role list, sends each owner a separate message, and logs every failure without throwing.
- Checked against a local SMTP sink (the dev `.env` points at a placeholder host, and no Docker/Mailpit was available). All five templates were sent through `sendEmail`/nodemailer with `<script>…</script> & "Bob's" <b>Co</b>` as every name, reason and plan. The delivered HTML parts had no raw markup, only escaped entities. Links resolved to `/admin/organizations/<encoded id>`, `/<slug>` and `/organizations`, and the rejected and suspended emails named the support address. Subjects carry the raw name, which is correct because they are plain-text headers.
