# T-21: Org billing page

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 3: Plans and subscriptions | M | [03](../../specs/03-plans-and-subscriptions.md) | [T-18](../03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |

- `/<slug>/settings/billing`, plus a **Billing** tab in `SettingsNav`, visible to every member.
- `BillingOverview`:
  - plan and state badge, and the end date
  - usage bars
  - feature list
  - an expired or canceled notice
  - a `mailto:` link to `siteConfig.supportEmail`

**Done when**
- [ ] The page shows the right figures for each state, and the usage bars match the real counts.
