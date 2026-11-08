# T-20: Gate features by plan

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 3: Plans and subscriptions | M | [03](../../specs/03-plans-and-subscriptions.md) | [T-18](../03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |

- `reports`: the reports page, `getScanReport` and the QR analytics loader. The pages show an upgrade notice.
- `auditLog`: the audit log page and `getAuditLog`.
- `csvExport`: the CSV loaders in `features/qr/libs/qr.ts` and `features/reports/libs/reports.ts`. The CSV buttons are hidden when the plan lacks the feature.
- Audit entries are still written on plans without `auditLog`.

**Done when**
- [ ] Calling each gated loader directly on a plan without the feature returns FORBIDDEN.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F4 | **CSV export is a loader, not an action.** CSV comes from loaders in `features/qr/libs/qr.ts` and `features/reports/libs/reports.ts`. Spec 03 calls it "CSV export action". | Low | Gate both loaders. | T-20 |
