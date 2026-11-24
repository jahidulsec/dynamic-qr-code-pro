# T-24: Admin dashboard

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 4: Panel polish | M | [04](../../specs/04-admin-panel.md) | [T-16](../04-admin-panel/T-16-admin-organizations-list.md) |

- Six stat tiles, each linked to its filtered list, plus "Pending requests" (the 5 oldest, with Review and Reject buttons) and "Recent admin activity" (the latest 10). Every count is read fresh.

**Done when**
- [ ] After an approval, the pending count matches the Pending tab with no reload.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F11 | **"Expiring soon" is loosely defined.** It would include canceled subscriptions. | Low | Count only rows with status `TRIALING` or `ACTIVE` and a non-null `currentPeriodEnd` between now and now + 7 days. | T-24 |

**Notes**

- The "Expiring soon" tile links to `/admin/organizations?status=all&expiring=7`, not `?expiring=7`. Without a status the list opens on the Pending tab whenever requests are waiting, and pending organizations have no subscription yet, so that tab would always show none. The tile counts with the list's own filter (`buildAdminOrganizationWhere({ expiring: true })`, F11), so the two always agree.
- Pending rows offer **Review** (opens the detail page, where Approve lives) and **Reject** (the same reason dialog as the detail page), as the spec lists; there is no inline Approve.
- The Users tile links to `/admin/users`, still a placeholder until its ticket lands.
