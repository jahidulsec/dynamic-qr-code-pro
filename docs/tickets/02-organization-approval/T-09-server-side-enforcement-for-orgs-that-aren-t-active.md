# T-09: Server-side enforcement for orgs that aren't active

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | M | [02](../../specs/02-organization-approval.md) | [T-03](../01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md) |

- `get-membership.ts`:
  - `requireMembership` throws `FORBIDDEN "This organization isn't active"` unless the org is `ACTIVE`
  - `getMembership` / `getAccess` expose `organization.status`
- Organization hooks:
  - `beforeCreateInvitation` and `beforeAcceptInvitation` refuse invitations for orgs that aren't active
- Check that `hasPermission` returns false for those orgs.

**Done when**
- [x] On a PENDING org, every QR, tag, report, member, role and settings action returns "This organization isn't active".
- [x] Accepting an invitation to a SUSPENDED org is refused.

**Notes**
- Every QR, tag, report, member, role and settings loader and action goes through `requireMembership` (directly or via `requirePermission`), so the single status check there covers them all. Both boxes were verified by code path, not against a database (the dev DB isn't local).
- The invitation hooks read `organization.status` from the object better-auth passes in. `findOrganizationById` (accept) and the create-invitation lookup return additional fields, and they're fresh DB reads, not cached.
- `leaveOrganizationAction` and `deleteOrganizationAction` are also refused for orgs that aren't active, as spec 02 expects. Owners withdraw through T-10's action.
- Until T-11 adds the status screen, members who open a pending org's URL see the app shell with every loader failing.
- `npx next build` fails on prerendering `/[organizationSlug]/*` (`usePathname` in `NavigationProgress`, `CLIENT_HOOK_DYNAMIC`). It fails the same way without this change.
