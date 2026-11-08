# T-22: Admin subscription controls

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 3: Plans and subscriptions | M | [03](../../specs/03-plans-and-subscriptions.md), [04](../../specs/04-admin-panel.md) | [T-17](../04-admin-panel/T-17-admin-organization-detail-and-review-dialogs.md), [T-18](../03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |

- `setSubscriptionAction`, `extendSubscriptionAction` and `cancelSubscriptionAction`, each writing an audit entry with the before and after values.
- `subscriptionChangedEmail`, sent on a plan change when "Email owners" is ticked.
- The subscription section on the detail page, with the Change plan, Extend and Cancel dialogs.

**Done when**
- [ ] Extending an expired subscription restores its plan straight away, and canceling moves the org to Free limits straight away.
- [ ] Archived plans can't be selected.
