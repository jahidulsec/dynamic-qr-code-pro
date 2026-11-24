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

**Notes**
- `Entitlements` gains `subscriptionPlan` (the plan on the subscription row whatever its state, null when there's none). The expired/canceled notice needs the name of the plan that ended, and `plan` is already the default plan by then.
- Usage is counted the same way the limit checks count it: live (not trashed) QR codes; members **plus** pending, unexpired invitations (the caption breaks this down); custom roles, with the limit capped at `MAX_CUSTOM_ROLES` as on the Roles page.
- The counts are put together in the page, not a billing loader: `qr` and `organizations` already import `@/features/billing/server`, so billing reading their data would make a cycle.
- A canceled plan has no "ended on" date in `Entitlements` (`canceledAt` isn't carried), so its notice reads "Your {plan} plan was canceled."
