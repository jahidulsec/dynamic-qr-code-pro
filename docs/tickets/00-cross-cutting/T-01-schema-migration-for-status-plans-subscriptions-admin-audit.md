# T-01: Schema migration for status, plans, subscriptions, admin audit log and admin fields

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 1: Foundation | L | [01](../../specs/01-admin-access.md), [02](../../specs/02-organization-approval.md), [03](../../specs/03-plans-and-subscriptions.md), [04](../../specs/04-admin-panel.md) | none |

- `prisma/schema.prisma`:
  - `OrganizationStatus` enum, plus `status`, `statusReason`, `reviewedAt` and `reviewedById` on `Organization`, with an index on `(status, createdAt)`
  - `Plan` model
  - `SubscriptionStatus` and `BillingInterval` enums, and the `Subscription` model
  - `AdminAuditLog` model
  - admin plugin fields: `User.role` / `banned` / `banReason` / `banExpires`, and `Session.impersonatedBy`
  - back-relations (F13)
- Migration `…_admin_approval_subscriptions`:
  - backfill existing orgs to `ACTIVE`, with `reviewedAt = NOW()`
  - seed `free` (default), `pro` and `business` with fixed ids (F7)
  - backfill every existing org with a subscription, using the plan chosen for F6
- Run `npm run db:migrate`.

**Done when**
- [ ] `prisma migrate status` is clean, and `generated/prisma` has been regenerated.
- [ ] Every existing org is `ACTIVE` and has exactly one subscription, every user has `role = 'user'`, and exactly one plan has `isDefault = true`.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F6 | **The Pro backfill can take capacity away from existing orgs.** They can create up to 20 custom roles today (`MAX_CUSTOM_ROLES`), but seeded Pro allows 5. Orgs that already have more than 5 lose the ability to add roles. | Medium | **Needs a decision:** seed Pro with `maxCustomRoles = 20`, or backfill existing orgs onto a hidden `legacy` plan (500 QR codes, unlimited members, 20 roles). I recommend `legacy`. | T-01 |
| F7 | **The migration needs fixed ids for seeded rows.** Plain SQL can't call `cuid()`. | Low | Seed plans with fixed ids (`plan_free`, `plan_pro`, …), and backfill subscriptions with `CONCAT('sub_', organization.id)`. | T-01 |
| F10 | **The phases depend on each other.** Approval (phase 2) creates a subscription, which needs plans that phase 3 manages. | Low | Plans are seeded in the phase 1 migration. `QR_QUOTA` stays in force until T-19, so there's no gap in limits. | T-01, T-15 |
| F13 | **New relations need back-relations.** `reviewedBy`, `AdminAuditLog.actor` and `Organization.subscription` need named back-relations on `User` and `Organization`, or the Prisma schema won't validate. | Low | Add them in the schema change. | T-01 |
