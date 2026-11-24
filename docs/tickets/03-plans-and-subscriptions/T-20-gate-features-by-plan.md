# T-20: Gate features by plan

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 3: Plans and subscriptions | M | [03](../../specs/03-plans-and-subscriptions.md) | [T-18](../03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |

- `reports`: the reports page, `getScanReport` and the QR analytics loader. The pages show an upgrade notice.
- `auditLog`: the audit log page and `getAuditLog`.
- `csvExport`: the CSV loaders in `features/qr/libs/qr.ts` and `features/reports/libs/reports.ts`. The CSV buttons are hidden when the plan lacks the feature.
- Audit entries are still written on plans without `auditLog`.

**Done when**
- [x] Calling each gated loader directly on a plan without the feature returns FORBIDDEN.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F4 | **CSV export is a loader, not an action.** CSV comes from loaders in `features/qr/libs/qr.ts` and `features/reports/libs/reports.ts`. Spec 03 calls it "CSV export action". | Low | Gate both loaders. | T-20 |

## Notes

- **Where each check sits.** `requireEntitlement(await getEntitlements(orgId), feature)` runs right after the permission check, so a viewer without the permission still gets the permission message:
  - `getScanReport`: `reports`. `exportScanReport`: `reports` and `csvExport`. Both go through `loadReport` in `features/reports/libs/reports.ts`.
  - `getQrAnalytics`: `reports`. `exportQrCodes`: `csvExport`. `exportQrScans`: `reports` and `csvExport`, because it exports raw scan data.
  - `getAuditLog`: `auditLog`. `recordAudit` is unchanged, so entries are still written on every plan.
- **What a refusal looks like.** `apiResponse.error` doesn't carry an HTTP status. A refused loader returns `success: false` with the `PLAN_FEATURE_DENIED_MESSAGES` text, the same way permission refusals come back.
- **Plan features in the client.** `AccessProvider` now also carries `features`, which the org layout fills from `getEntitlements`. `useAccess().has(feature)` hides:
  - the three CSV buttons without `csvExport`
  - the analytics button without `reports`; it falls back to its plain label, as it does without `report:read`
- **Pages.** The reports page and the audit log page show `PlanUpgradeNotice` (`@/features/billing`) in place of their data. The Audit log tab stays in `SettingsNav`, so members can find the notice. The notice doesn't link to a billing page yet (T-21).
- **How "Done when" was checked.** The loaders need a signed-in session, so the check used the real `requireEntitlement` / `resolveEntitlements` against the seeded Free plan and a plan with no features. Every gated feature returned FORBIDDEN, and Pro allowed all three. The loaders weren't called end to end.
