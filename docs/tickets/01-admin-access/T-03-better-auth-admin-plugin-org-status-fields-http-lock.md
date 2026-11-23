# T-03: better-auth: admin plugin, org status fields, HTTP lock

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 1: Foundation | M | [01](../../specs/01-admin-access.md), [02](../../specs/02-organization-approval.md) | [T-01](../00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md) |

- `lib/auth/admin-permissions.ts`:
  - the admin plugin's own access control, built from its `defaultStatements`
  - roles `user` (no grants) and `superadmin` (everything except `impersonate*`)
  - no role named `admin` is registered
- Register `admin({ ac, roles, defaultRole: "user", adminRoles: ["superadmin"] })` in `lib/auth/auth.ts`, keeping `nextCookies()` last.
- Organization `schema.organization.additionalFields`: `status` (default `"PENDING"`, `input: false`) and `statusReason` (`input: false`).
- In the `before` hook, refuse HTTP requests to paths starting with `/admin/`.
- `lib/auth/auth-client.ts`: add `adminClient` only if the UI needs it. The panel uses server actions, so it probably doesn't.

**Done when**
- [x] `POST /api/auth/admin/list-users` over HTTP returns 403.
- [x] `POST /api/auth/organization/create` with `status: "ACTIVE"` in the body still creates a PENDING org.
- [x] `npx tsc --noEmit` passes.

**Notes**
- `list-users` is a GET endpoint in better-auth 1.7, so a POST returns 404. Over HTTP, `GET /admin/list-users`, `POST /admin/ban-user`, `/admin/set-role`, `/admin/impersonate-user` and `/admin/remove-user` all return 403 from the `before` hook.
- The PENDING check hasn't been run against a database yet. In the code, better-auth leaves `input: false` fields out of the `/organization/create` body schema (`toZodSchema` with `isClientSide`), zod drops the unknown `status` key, and `parseOrganization` re-parses the result. The column default is `PENDING`.
- `SUPERADMIN_ROLE` is exported from `lib/auth/admin-permissions.ts` for T-04 and T-05.

**Notes**
- `list-users` is a **GET** endpoint in better-auth 1.7, so `POST /api/auth/admin/list-users` returns 404 (no such route). `GET /api/auth/admin/list-users` and `POST` to `ban-user`, `set-role`, `impersonate-user` and `remove-user` all return 403 "Admin endpoints are not available over HTTP". Without a session the same requests would otherwise get 401, which shows the lock runs first. It doesn't look at the session, so an admin session gets 403 too.
- The PENDING check was run against the configured `auth` instance without writing to the database (the dev DB isn't local). `auth.api.createOrganization`'s body schema drops `status` and `statusReason` (`input: false`), the field is registered with `defaultValue: "PENDING"`, and the column defaults to `PENDING` as well.
- `adminClient` was not added to `auth-client.ts`, since the panel uses server actions.
- `lib/auth/admin-permissions.ts` also exports `SUPERADMIN_ROLE`, for T-04 and T-05 to use.
