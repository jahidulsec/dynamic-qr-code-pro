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
- [ ] There is always exactly one default plan, the default can't be archived, and a plan that's in use can't be deleted.
