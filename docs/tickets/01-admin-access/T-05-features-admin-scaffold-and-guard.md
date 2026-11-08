# T-05: `features/admin` scaffold and guard

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 1: Foundation | S | [01](../../specs/01-admin-access.md) | [T-03](../01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md) |

- `features/admin/{index.ts, server.ts, constants.ts}`.
- `getAdminSession()`: uses React `cache()` (per request), reads the session fresh, and returns null unless the user is a `superadmin` who isn't banned (F12).
- `requireAdmin()`: throws `UNAUTHORIZED` or `FORBIDDEN` as an `APIError`.

**Done when**
- [ ] Unit-level manual check: an org `member.role = "admin"` gets FORBIDDEN, and a superadmin whose DB row has `banned = true` gets FORBIDDEN.
- [ ] `npm run lint` passes the feature-boundary rules.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F12 | **One acceptance criterion contradicts another rule.** Spec 01 says "a banned admin is refused at the next request", but spec 04 forbids banning a superadmin. | Low | Keep the `banned` check in `requireAdmin`, since a superadmin can still be banned directly in the database. Change the criterion to "a superadmin with `banned = true` (set via DB) is refused". | T-05 |
