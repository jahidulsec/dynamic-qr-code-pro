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
