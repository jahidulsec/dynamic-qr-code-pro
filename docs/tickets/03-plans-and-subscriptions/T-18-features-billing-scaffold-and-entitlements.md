# T-18: `features/billing` scaffold and entitlements

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 3: Plans and subscriptions | M | [03](../../specs/03-plans-and-subscriptions.md) | [T-01](../00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md), [T-02](../00-cross-cutting/T-02-env-config-and-cache-tags.md) |

- Services `plan.ts` and `subscription.ts`.
- `PLAN_FEATURES` constants.
- `planFormSchema` and `subscriptionFormSchema`, including F5 and "period end after period start".
- `resolveEntitlements(subscription, defaultPlan)` (a pure function), plus `getEntitlements(orgId)`, which reads fresh and is shared per request through React `cache()`.
- `requireEntitlement(access, feature)` and `assertWithinLimit(access, "qrCodes" | "members" | "customRoles", used, adding = 1)`.

**Done when**
- [ ] `resolveEntitlements` returns the right state and plan for all four rows of the spec 03 table: none, current, expired and canceled.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F5 | **A trial can have no end date.** `TRIALING` with `currentPeriodEnd = null` never expires. | Low | Validation: `TRIALING` requires `currentPeriodEnd`. | T-18 |
