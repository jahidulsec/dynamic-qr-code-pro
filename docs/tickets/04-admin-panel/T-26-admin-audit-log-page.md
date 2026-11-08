# T-26: Admin audit log page

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 4: Panel polish | M | [04](../../specs/04-admin-panel.md) | [T-14](../04-admin-panel/T-14-audit-plumbing-for-admin-actions.md) |

- `/admin/audit-log`: filter by action, actor and target type, newest first, 50 entries per page. Each row reads as a sentence, with a details line.

**Done when**
- [ ] Every admin action from T-15, T-22, T-23 and T-25 shows up with readable details.
