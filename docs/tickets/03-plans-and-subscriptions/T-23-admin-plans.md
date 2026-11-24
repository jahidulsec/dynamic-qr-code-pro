# T-23: Admin plans

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 3: Plans and subscriptions | L | [03](../../specs/03-plans-and-subscriptions.md), [04](../../specs/04-admin-panel.md) | [T-07](../01-admin-access/T-07-admin-shell.md), [T-18](../03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |

- `/admin/plans` (list) and `/admin/plans/[id]` (form). New plans use the same form.
- Actions:
  - create and update, with the key immutable and matching `^[a-z][a-z0-9-]{1,31}$`
  - set default: one transaction that clears the previous default
  - archive and unarchive: the default plan can't be archived
  - unknown feature keys are dropped on save
- An "{n} organizations on this plan" warning when editing.

**Done when**
- [x] There is always exactly one default plan, the default can't be archived, and a plan that's in use can't be deleted.

**Notes**
- There is no delete action. A plan that's in use is protected by `onDelete: Restrict` on `subscription.planId`, and the panel only offers archive, as the spec says.
- `setDefaultPlan` clears the old default and sets the new one in one transaction. Both writes are `updateMany` (locking reads in InnoDB), and setting the default is conditional on `archivedAt: null`. Archiving is conditional on `isDefault: false`, so an archive and a default switch that run at the same time can't leave the default archived.
- The form takes prices in major units (`9.99`) and sends cents to the actions. An empty limit needs its "Unlimited" box ticked.
- "{n} organizations" counts every subscription row on the plan, including expired and canceled ones, because those rows also keep the plan from being deleted. On the default plan, the warning also says it covers organizations without a subscription in effect.
- `describeAdminAuditMetadata` no longer adds "No end date" to entries with `before`/`after` metadata that have no period fields, such as `plan.update`.
