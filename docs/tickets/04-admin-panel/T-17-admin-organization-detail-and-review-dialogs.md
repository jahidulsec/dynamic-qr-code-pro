# T-17: Admin organization detail and review dialogs

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | L | [04](../../specs/04-admin-panel.md) | [T-15](../02-organization-approval/T-15-review-actions.md), [T-16](../04-admin-panel/T-16-admin-organizations-list.md) |

- `/admin/organizations/[id]`, with sections for:
  - the header, with the actions allowed for the current status
  - status
  - members
  - usage
  - the subscription (read-only until T-22)
  - history
- Approve dialog (plan select defaulting to the default plan, status, period end), plus the Reject and Suspend dialogs, using `useTransition` and toasts.

**Done when**
- [ ] An admin can review a request end to end, and the status, history and dashboard counts update without a reload.
