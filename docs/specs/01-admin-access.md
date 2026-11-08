# 01: Admin access

## Goal

Platform operators sign in at `/admin/login` and work in a panel at `/admin`. Nobody else can reach the panel, its loaders or its actions.

## Identity

- Use better-auth's **`admin` plugin**. It adds these fields to `user`:
  - `role` (string, default `"user"`)
  - `banned` (boolean)
  - `banReason`
  - `banExpires`

  It also adds `impersonatedBy` to `session`.
- Configure the plugin with **its own** access control, which is separate from the organization `ac` in `lib/auth/permissions.ts`:
  - roles: `user` (no grants) and `superadmin` (every admin-plugin statement except `impersonate` and `impersonate-admins`)
  - `defaultRole: "user"`, `adminRoles: ["superadmin"]`
  - The plugin's built-in role named `admin` must **not** be registered. Only `superadmin` has admin power, so `"admin"` stays an organization-only role name.
- **Impersonation is out of scope for v1** and is not granted.
- Banned users are refused at sign-in by the plugin. Banning a user also revokes their sessions (spec 04).

### Closing the plugin's HTTP endpoints

The admin plugin exposes `/api/auth/admin/*` endpoints. Called over HTTP, they would skip our audit log. Add a `ctx.path.startsWith("/admin/")` check to the existing `before` hook in `lib/auth/auth.ts`, so that only server-side `auth.api` calls from our actions can reach those endpoints. This works the same way `SERVER_ACTION_ONLY_PATHS` does today.

## Creating the first admin

The app has no way to sign up as an admin.

```
npm run admin:create -- --email owner@example.com
```

- `scripts/create-admin.ts` (run with `tsx`, which is added as a dev dependency) finds the user by email and sets `role = "superadmin"`.
- It fails with a clear message if no user has that email or the email isn't verified. The person signs up through the normal flow first.
- `npm run admin:create -- --email … --revoke` sets the role back to `user`.
- Promoting and demoting admins from inside the panel is out of scope for v1.

## Routes

```
app/admin/
  login/page.tsx            public; outside the guard
  (panel)/layout.tsx        guard + admin shell (sidebar, header)
  (panel)/page.tsx          dashboard (spec 04)
  (panel)/…                 every other admin page
```

- `admin` is already a reserved organization slug, so `/admin` can't clash with `/[organizationSlug]`.
- Every admin page has `robots: { index: false, follow: false }`.
- Request-time reads sit under `<Suspense>`, as the rest of the app does.

## `/admin/login`

| State | Behavior |
| --- | --- |
| Not signed in | Show the admin sign-in form (email and password), with the heading "Admin sign in". There's no sign-up link. A "Forgot password" link goes to the normal `/forgot-password`. |
| Signed in as an admin | Redirect to `/admin`. |
| Signed in as a non-admin | Show "Signed in as {email}. This account doesn't have admin access." with a **Switch account** button (the existing `SwitchAccountButton`). |

**Submitting the form** calls the `adminSignInAction` server action:

1. Parse the input with the existing `signInSchema`.
2. Call `auth.api.signInEmail`.
3. If the signed-in user isn't a superadmin, **sign out immediately** and return "This account doesn't have admin access". The person has already proved they know the password, so saying the account exists reveals nothing new.
4. Unverified email: return "Verify your email before signing in". Admins don't take the normal verify-email redirect.
5. Banned user: return the plugin's banned message.
6. On success, redirect to `/admin`.

Admins share the normal session cookie. An admin who is also a member of organizations can use both the panel and their workspaces in the same session.

## The guard

`features/admin/server.ts` exports:

```ts
getAdminSession(): Promise<AdminSession | null>  // cached per request; null unless role === "superadmin" && !banned
requireAdmin(): Promise<AdminSession>            // throws APIError UNAUTHORIZED (no session) / FORBIDDEN (not admin)
```

- `(panel)/layout.tsx` calls `getAdminSession()`. With no session it redirects to `/admin/login`. A signed-in non-admin is also redirected to `/admin/login`, which shows the "no admin access" state.
- **Every admin loader and action calls `requireAdmin()` itself.** Layouts don't run for server actions, so the layout check alone protects nothing.
- `requireAdmin` reads the role from a fresh session lookup, never from cached data. A demoted or banned admin loses access on their next request.
- When catching errors around `requireAdmin`, catch only `APIError` and rethrow everything else. This is the same convention as `requireOrganization`.

## Admin shell

- The left sidebar uses `components/ui/sidebar`:
  - **Dashboard:** `/admin`
  - **Organizations:** `/admin/organizations`, with a badge showing the pending count
  - **Plans:** `/admin/plans`
  - **Users:** `/admin/users`
  - **Audit log:** `/admin/audit-log`
- The footer shows the admin's name and email, plus links to **Back to app** (`/organizations`) and **Sign out** (which goes to `/admin/login`).

## Acceptance criteria

- [ ] Visiting `/admin` with no session redirects to `/admin/login`.
- [ ] A verified, non-banned user with `role = "user"` can't open any `/admin` page, and every admin server action returns FORBIDDEN for them.
- [ ] Signing in at `/admin/login` with a non-admin account leaves no session behind and shows the "no admin access" message.
- [ ] `npm run admin:create -- --email x` promotes a verified user, and `--revoke` demotes them. Both fail clearly for an unknown or unverified email.
- [ ] `POST /api/auth/admin/ban-user` (or any `/admin/*` endpoint) over HTTP returns 403, even with an admin session.
- [ ] Setting `member.role = "admin"` in an organization grants no platform access.
- [ ] A banned admin is refused at the next request, not only at the next sign-in.
