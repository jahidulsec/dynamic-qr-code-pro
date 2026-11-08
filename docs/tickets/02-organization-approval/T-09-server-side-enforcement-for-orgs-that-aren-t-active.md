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
- [ ] On a PENDING org, every QR, tag, report, member, role and settings action returns "This organization isn't active".
- [ ] Accepting an invitation to a SUSPENDED org is refused.
