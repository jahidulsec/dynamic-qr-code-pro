# T-10: Org list: status rows, request notice, withdraw

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | M | [02](../../specs/02-organization-approval.md) | [T-09](../02-organization-approval/T-09-server-side-enforcement-for-orgs-that-aren-t-active.md) |

- Check F9 first, then load the status fields. Status is never cached.
- `OrganizationList` rows by status:
  - PENDING: not a link, with a badge and "Submitted …"
  - REJECTED: not a link, with a badge, the reason and **Withdraw request**
  - SUSPENDED: a link, with a badge
- Show the `?requested=<slug>` success notice.
- `withdrawOrganizationRequestAction(organizationId)`: owner only, PENDING or REJECTED only, deletes the org, then calls `refresh()`.

**Done when**
- [ ] The `/organizations` page and the signed-in `/sign-in` view both show the status rows.
- [ ] Pending rows can't be clicked and are announced as disabled.
- [ ] Withdrawing frees the slug for reuse.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F9 | **`listOrganizations` may not return the new fields.** It isn't confirmed that better-auth includes `additionalFields` in `listOrganizations`. | Low | Check this first. If it doesn't, read `id → status, statusReason, createdAt` with Prisma for the listed ids. | T-10 |
