# T-04: Bootstrap script `admin:create`

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 1: Foundation | S | [01](../../specs/01-admin-access.md) | [T-03](../01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md) |

- Add `tsx` as a dev dependency, plus `"admin:create": "tsx scripts/create-admin.ts"`.
- `--email <e>` promotes a verified user. `--revoke` demotes them.
- Clear errors for an unknown email, an unverified user, or a user who's already in the target state.
- Add a README section titled "Creating the first admin".

**Done when**
- [ ] Each case above prints the right message and exits with the right code: 0 on success, 1 on error.
