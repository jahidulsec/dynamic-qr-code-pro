# T-06: `/admin/login`

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 1: Foundation | M | [01](../../specs/01-admin-access.md) | [T-05](../01-admin-access/T-05-features-admin-scaffold-and-guard.md) |

- `app/admin/login/page.tsx`, inside a `<Suspense>` gate:
  - signed-in admin: redirect to `/admin`
  - signed-in non-admin: show the "no admin access" message and `SwitchAccountButton`
  - signed out: show `AdminLoginForm`
- `adminSignInAction` follows **F1**:
  1. Parse with `signInSchema`.
  2. Look up the user by email. If it isn't a non-banned superadmin, return the generic error.
  3. If the email is unverified, return "Verify your email before signing in".
  4. Call `signInEmail`.
  5. Redirect to `/admin`.
- `noindex`, with no sign-up link.

**Done when**
- [ ] Signing in with a non-admin account creates no `session` row and sets no cookie.
- [ ] Signing in with an admin account lands on `/admin`.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F1 | **Admin sign-in leaves a session behind for non-admins.** `signInEmail` sets the session cookie through `nextCookies()` before the action can see the role, so "sign out immediately" has to revoke the token and clear the cookie. If the person was already signed in as someone else, that session's cookie is overwritten. | High | Before calling `signInEmail`, look the email up. If the user isn't a non-banned `superadmin`, return one generic error, "Invalid email or password, or this account doesn't have admin access", without creating a session. This replaces the spec's "sign out after sign-in" step. | T-06 |
