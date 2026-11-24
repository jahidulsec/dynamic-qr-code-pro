# T-26: Admin audit log page

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 4: Panel polish | M | [04](../../specs/04-admin-panel.md) | [T-14](../04-admin-panel/T-14-audit-plumbing-for-admin-actions.md) |

- `/admin/audit-log`: filter by action, actor and target type, newest first, 50 entries per page. Each row reads as a sentence, with a details line.

**Done when**
- [x] Every admin action from T-15, T-22, T-23 and T-25 shows up with readable details.

**Notes**
- The details line comes from `describeAdminAuditMetadata(metadata, action)`. It moved from `libs/admin-organization-query.ts` to `libs/admin-audit-details.ts` and now takes the action into account. User entries show the email, plus the ban expiry ("Until: …" or "Permanent") or the number of sessions revoked. `plan.update` lists the fields that changed. `plan.create` shows the key, `subscription.extend` shows "By: 1 month/year", and `plan.default` reads "Free → Pro". The dashboard's recent activity and the org History section use the same function, so they show the same details.
- The actor filter works on `actorId`. Entries from a deleted admin account (`actorId = null`) still appear under "All admins" but can't be picked on their own.
- Lists and counts are read with `{ cache: false }`, like the dashboard's activity list, so an action shows up the moment it commits.
- The page has no admin audit entries yet, so it wasn't checked in a browser. The box was ticked after running the describer on metadata shaped like each writer's (all 15 actions), plus `tsc`/build.
- `AdminPlaceholder` was removed, because this page was its last user.

