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
- [x] Signing in with a non-admin account creates no `session` row and sets no cookie.
- [ ] Signing in with an admin account lands on `/admin`.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F1 | **Admin sign-in leaves a session behind for non-admins.** `signInEmail` sets the session cookie through `nextCookies()` before the action can see the role, so "sign out immediately" has to revoke the token and clear the cookie. If the person was already signed in as someone else, that session's cookie is overwritten. | High | Before calling `signInEmail`, look the email up. If the user isn't a non-banned `superadmin`, return one generic error, "Invalid email or password, or this account doesn't have admin access", without creating a session. This replaces the spec's "sign out after sign-in" step. | T-06 |

**Notes**
- `adminSignInAction` lives in `features/admin/actions/admin-sign-in.ts`. It looks the user up through a new private `features/admin/services/user.ts` (`getUser`, `{ cache: false }`). `features/auth` now also exports `signInSchema` and `SignInValues`, so the admin form and action reuse them.
- A wrong password for a real superadmin also returns the generic F1 message (`INVALID_EMAIL_OR_PASSWORD` is mapped to it), so the form gives the same answer for unknown emails, wrong passwords and non-admins.
- The unverified check runs before the password, as the ticket orders it, so it shows that an email belongs to an unverified superadmin. In practice this can't happen, because `admin:create` only promotes verified users.
- `/admin/login` uses its own centred layout with `SiteLogo`, because it sits outside the `(auth)` group and its marketing aside.
- Verified against the dev server and database by calling `adminSignInAction` directly:
  - a verified non-admin email, an upper-case variant of it and an unknown email each returned the generic message
  - none of these responses had a `Set-Cookie` header, and the `session` count stayed at 4
  - the page rendered "Admin sign in" with `noindex, nofollow` and no sign-up link
- The second box is unticked. Signing in as an admin needs a superadmin's password, and the `/admin` page itself comes with T-07. The action redirects to `ADMIN_HOME_PATH` (`/admin`) after `signInEmail` succeeds.
