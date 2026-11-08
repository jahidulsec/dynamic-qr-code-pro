# T-14: Audit plumbing for admin actions

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | S | [04](../../specs/04-admin-panel.md) | [T-01](../00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md), [T-05](../01-admin-access/T-05-features-admin-scaffold-and-guard.md) |

- `ADMIN_AUDIT_ACTIONS` map (client-safe), and `writeAdminAudit(tx, entry)`.
- Add `organization.approve`, `reject`, `suspend` and `reactivate` to the org `AUDIT_ACTIONS`. Org-side entries are written as "Platform team" (F2).

**Done when**
- [ ] Both writers accept a transaction client, and the org audit log page renders the new actions.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F2 | **Admins' personal names would show up in customers' audit logs.** Spec 02 writes approve and suspend entries to the org `AuditLog` with the admin as the actor. | Medium | Org-side entries use `actorId = null` and `actorName = "Platform team"`. The real admin is recorded only in `AdminAuditLog`. | T-14 |
