# T-16: Admin organizations list

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | M | [04](../../specs/04-admin-panel.md) | [T-07](../01-admin-access/T-07-admin-shell.md) |

- `/admin/organizations`:
  - status tabs with counts, plus search, plan and expiring filters, all kept in URL params
  - the columns from spec 04
  - pending rows sorted oldest first
- `"use server"` loader in `features/admin/libs/admin-organizations.ts`, which calls `requireAdmin` and reads fresh.

**Done when**
- [ ] Filters and the page number survive reloads and the back button.
- [ ] Tables scroll inside their card at phone width.
