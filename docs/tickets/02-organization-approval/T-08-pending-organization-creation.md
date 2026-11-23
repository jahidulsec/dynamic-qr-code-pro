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

**Notes**
- The admin notification is sent from better-auth's `afterCreateOrganization` hook, not from `createOrganizationAction`, so creates made directly through `/api/auth/organization/create` notify admins too. Each address gets its own message through `Promise.allSettled`. Failures are logged and the hook never throws. With `ADMIN_NOTIFY_EMAILS` unset, the list is empty and nothing is sent.
- The pending cap counts memberships whose role list includes the exact `owner` key in organizations with status `PENDING`. Two creates sent at the same moment could both pass the check and give a user 3 pending orgs. That's acceptable for a soft cap.
- `createOrganization` still makes the new pending org the active one. T-09/T-11 decide what that means for access, so it isn't changed here.
- The success notice for `?requested=<slug>` belongs to T-10.
- Neither box has been checked at runtime. The dev DB isn't local, and SMTP points at a placeholder host.
