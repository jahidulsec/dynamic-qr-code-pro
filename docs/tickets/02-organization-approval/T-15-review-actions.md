# T-15: Review actions

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | L | [02](../../specs/02-organization-approval.md) | [T-09](../02-organization-approval/T-09-server-side-enforcement-for-orgs-that-aren-t-active.md), [T-13](../02-organization-approval/T-13-status-email-templates.md), [T-14](../04-admin-panel/T-14-audit-plumbing-for-admin-actions.md) |

- `approveOrganizationAction`, `rejectOrganizationAction`, `suspendOrganizationAction` and `reactivateOrganizationAction` in `features/admin/actions/review-organization.ts`.
- Each one:
  1. calls `requireAdmin`
  2. parses its input with zod (a reason of 3–500 characters where required)
  3. runs a conditional `updateMany` on the expected `from` status, and returns "already reviewed" if it matches no row
  4. sets `reviewedAt` / `reviewedById`
  5. writes both audit entries
- Approve also creates the subscription with the chosen plan in the same `$transaction`. Archived plans are refused.
- Emails go out after the commit. Call `refresh()` last.

**Done when**
- [ ] Each transition in the spec 02 table works, and every other transition is refused.
- [ ] Two approvals of the same request at the same time produce one success, one email and one subscription.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F10 | **The phases depend on each other.** Approval (phase 2) creates a subscription, which needs plans that phase 3 manages. | Low | Plans are seeded in the phase 1 migration. `QR_QUOTA` stays in force until T-19, so there's no gap in limits. | T-01, T-15 |
