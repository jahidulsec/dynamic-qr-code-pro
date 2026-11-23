# T-05: `features/admin` scaffold and guard

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 1: Foundation | S | [01](../../specs/01-admin-access.md) | [T-03](../01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md) |

- `features/admin/{index.ts, server.ts, constants.ts}`.
- `getAdminSession()`: uses React `cache()` (per request), reads the session fresh, and returns null unless the user is a `superadmin` who isn't banned (F12).
- `requireAdmin()`: throws `UNAUTHORIZED` or `FORBIDDEN` as an `APIError`.

**Done when**
- [x] Unit-level manual check: an org `member.role = "admin"` gets FORBIDDEN, and a superadmin whose DB row has `banned = true` gets FORBIDDEN.
- [x] `npm run lint` passes the feature-boundary rules.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F12 | **One acceptance criterion contradicts another rule.** Spec 01 says "a banned admin is refused at the next request", but spec 04 forbids banning a superadmin. | Low | Keep the `banned` check in `requireAdmin`, since a superadmin can still be banned directly in the database. Change the criterion to "a superadmin with `banned = true` (set via DB) is refused". | T-05 |

**Notes**
- The guard lives in `features/admin/services/admin-session.ts`. `server.ts` exports `getAdminSession`, `requireAdmin` and `AdminSession`. `index.ts` exports `ADMIN_HOME_PATH` and `ADMIN_LOGIN_PATH` for T-06 and T-07.
- The guard calls `auth.api.getSession` with `disableCookieCache: true` instead of reusing `getSession` from `features/organizations`. The cookie cache isn't enabled today, but this keeps the check fresh if it's turned on later.
- The manual check called the real `requireAdmin` and `getAdminSession` with a stubbed `next/headers` and a patched `auth.api.getSession`, with no database:
  - no session gave UNAUTHORIZED
  - `user.role = "user"` with org `member.role = "admin"` gave FORBIDDEN
  - `superadmin` with `banned = true` gave FORBIDDEN
  - `user.role = "admin"` gave FORBIDDEN
  - `superadmin` with `banned = null` passed
- `npm run lint` reports no feature-boundary errors. Its only error is an existing `react-hooks/set-state-in-effect` in `hooks/use-mobile.ts`. `npx next build` also fails, on an existing prerender error in `/accept-invitation/[id]` (`usePathname` outside `<Suspense>`). Neither file is touched by this ticket.
