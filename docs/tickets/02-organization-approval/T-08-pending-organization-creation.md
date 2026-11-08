# T-08: Pending organization creation

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | M | [02](../../specs/02-organization-approval.md) | [T-03](../01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md), [T-13](../02-organization-approval/T-13-status-email-templates.md) |

- `beforeCreateOrganization`: refuse once the user already owns 2 PENDING orgs. Don't use better-auth's `organizationLimit`, because it counts every membership.
- `createOrganizationAction`: redirect to `/organizations?requested=<slug>`.
- `/organizations/new`: add the review note under the form.
- After creating, send `organizationRequestEmail` to `ADMIN_NOTIFY_EMAILS` when it's set. A send failure is logged and never fails the create.

**Done when**
- [ ] A third pending request is refused with the spec message.
- [ ] The admin notification goes out, and a failing SMTP server doesn't block the create.
