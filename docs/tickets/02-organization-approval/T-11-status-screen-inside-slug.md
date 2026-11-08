# T-11: Status screen inside `/<slug>`

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | M | [02](../../specs/02-organization-approval.md) | [T-09](../02-organization-approval/T-09-server-side-enforcement-for-orgs-that-aren-t-active.md), [T-10](../02-organization-approval/T-10-org-list-status-rows-request-notice-withdraw.md) |

- `OrganizationShell`: when a member opens an org that isn't active, render `OrganizationStatusScreen` instead of the sidebar and children:
  - waiting for approval
  - not approved, with the reason and Withdraw
  - suspended, with the reason and the support contact
- Non-members still get `notFound()`.

**Done when**
- [ ] `/<pending>`, `/<pending>/settings/members` and `/<pending>/reports` all show the waiting screen.
- [ ] A non-member gets a 404.
