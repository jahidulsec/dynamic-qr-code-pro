# T-14: Audit plumbing for admin actions

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | S | [04](../../specs/04-admin-panel.md) | [T-01](../00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md), [T-05](../01-admin-access/T-05-features-admin-scaffold-and-guard.md) |

- `ADMIN_AUDIT_ACTIONS` map (client-safe), and `writeAdminAudit(tx, entry)`.
- Add `organization.approve`, `reject`, `suspend` and `reactivate` to the org `AUDIT_ACTIONS`. Org-side entries are written as "Platform team" (F2).

**Done when**
- [x] Both writers accept a transaction client, and the org audit log page renders the new actions.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F2 | **Admins' personal names would show up in customers' audit logs.** Spec 02 writes approve and suspend entries to the org `AuditLog` with the admin as the actor. | Medium | Org-side entries use `actorId = null` and `actorName = "Platform team"`. The real admin is recorded only in `AdminAuditLog`. | T-14 |

**Notes**
- `writeAdminAudit(tx, entry)` is in `features/admin/libs/admin-audit.ts` and is private to `features/admin`. `ADMIN_AUDIT_ACTIONS` is in `libs/admin-audit-actions.ts`, together with `ADMIN_AUDIT_TARGET_TYPES`, and is exported from `features/admin/index.ts`.
- The org-side writer is a new `writePlatformAudit(tx, entry)` (`features/organizations/libs/audit.ts`, exported from `server.ts`). It writes `actorId = null` and `actorName = "Platform team"` (F2). The existing `recordAudit` still runs after the change and only logs failures. Both transactional writers throw, so a failed entry rolls back the change it records.
- Neither writer can bust cache tags inside a transaction, so each comes with a tag list (`ADMIN_AUDIT_TAGS`, `PLATFORM_AUDIT_TAGS`) that callers bust after the commit.
- The org audit page renders the new actions through `AUDIT_ACTIONS`. Approve rows show "Plan: …" and reject/suspend rows show "Reason: …". This was verified by code path and `tsc`/lint, with no entries written yet, because T-15 is the first writer.
