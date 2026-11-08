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
- [ ] `POST /api/auth/admin/list-users` over HTTP returns 403.
- [ ] `POST /api/auth/organization/create` with `status: "ACTIVE"` in the body still creates a PENDING org.
- [ ] `npx tsc --noEmit` passes.
