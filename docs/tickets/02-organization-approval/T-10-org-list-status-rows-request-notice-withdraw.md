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
- [x] The `/organizations` page and the signed-in `/sign-in` view both show the status rows.
- [x] Pending rows can't be clicked and are announced as disabled.
- [x] Withdrawing frees the slug for reuse.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F9 | **`listOrganizations` may not return the new fields.** It isn't confirmed that better-auth includes `additionalFields` in `listOrganizations`. | Low | Check this first. If it doesn't, read `id → status, statusReason, createdAt` with Prisma for the listed ids. | T-10 |

**Notes**
- F9: better-auth's `listOrganizations` returns `status` and `statusReason` (its adapter runs `filterOutputFields(member.organization, orgAdditionalFields)`), and `createdAt` is a core field. It's a direct DB read on every request, so no Prisma status fallback is needed. It doesn't return the viewer's role, so the list does one fresh (`{ cache: false }`) member read, only when there's a REJECTED row, to show **Withdraw request** to owners only.
- The withdraw action deletes with a conditional Prisma `deleteMany({ where: { id, status: { in: ["PENDING", "REJECTED"] } } })` (`services/organization.ts`), not `auth.api.deleteOrganization`. better-auth's delete can't be conditioned on status, so an approval landing between the check and the delete would delete an active organization. The same transaction clears `session.activeOrganizationId` for that org, as better-auth's delete does. Members, invitations, roles and the subscription cascade in the database.
- The `?requested=` notice shows only when the slug matches one of the user's own organizations, so URL text is never echoed.
- Boxes were verified by code path and by `tsc`/`lint`, not against a database (the dev DB isn't local). `next build` fails at prerender with a `usePathname()` outside `<Suspense>` error in `NavigationProgress` (root layout). That failure is there without this ticket's changes too.
