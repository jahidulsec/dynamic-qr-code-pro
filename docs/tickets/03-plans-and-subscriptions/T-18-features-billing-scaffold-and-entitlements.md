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
- [x] `resolveEntitlements` returns the right state and plan for all four rows of the spec 03 table: none, current, expired and canceled.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F5 | **A trial can have no end date.** `TRIALING` with `currentPeriodEnd = null` never expires. | Low | Validation: `TRIALING` requires `currentPeriodEnd`. | T-18 |

## Notes

- **The resolver and loader are in separate files.** The pure `resolveEntitlements`, `requireEntitlement` and `assertWithinLimit` are in `libs/entitlements.ts`. The `getEntitlements` loader is in `libs/get-entitlements.ts` (server-only, uses React `cache()`). This lets the pure code run and be tested without loading Prisma. `server.ts` exports all four, as the spec says.
- **`resolveEntitlements` takes an optional `now`**, which defaults to `new Date()`, so tests can control the clock. A period that ends exactly at `now` counts as expired.
- **`assertWithinLimit` takes an optional 5th argument, `{ message }`.** Restoring from trash (T-19) needs a different message ("Restoring would exceed …"). The default messages are the ones in the spec's enforcement table.
- **`currentPeriodEnd` stays set when a plan has expired or been canceled.** `Entitlements.currentPeriodEnd` is still the subscription's end date in those states, so the billing page (T-21) can show "ended on {date}".
- **`subscriptionFormSchema` only accepts `TRIALING` and `ACTIVE`.** Canceling goes through `cancelSubscriptionAction`.
- **Plan and subscription writes clear the `subscriptions` cache tag.** Entitlement reads always skip the cache, so this only affects cached views.
- **Follow-up for T-22/T-23:** `features/admin/services/plan.ts` (added in T-16) duplicates billing's `getPlans`. Switch it to `@/features/billing/server` and delete it.
- **Verification:** a throwaway `tsx` script checked the four rows of the spec table, with every status and end-date combination. It also checked the guards and the F5 and period-order refinements. All passed. `tsc` passes. `npm run lint` and `next build` fail on errors that were already there and are unrelated to this ticket: `react-hooks/set-state-in-effect` in `hooks/use-mobile.ts`, and a `usePathname` blocking-prerender error in `components/shared/nav-progressbar/progress-bar.tsx` on `/[organizationSlug]/tags`.
