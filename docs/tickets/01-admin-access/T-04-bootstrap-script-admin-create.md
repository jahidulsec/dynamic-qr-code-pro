# T-04: Bootstrap script `admin:create`

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 1: Foundation | S | [01](../../specs/01-admin-access.md) | [T-03](../01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md) |

- Add `tsx` as a dev dependency, plus `"admin:create": "tsx scripts/create-admin.ts"`.
- `--email <e>` promotes a verified user. `--revoke` demotes them.
- Clear errors for an unknown email, an unverified user, or a user who's already in the target state.
- Add a README section titled "Creating the first admin".

**Done when**
- [x] Each case above prints the right message and exits with the right code: 0 on success, 1 on error.

**Notes**
- The script creates its own Prisma client from `DATABASE_URL` instead of importing `config/db.ts`. That module goes through `lib/env.ts`, which validates every server env var (SMTP, secrets), and a one-off CLI shouldn't need those.
- Emails are trimmed and lower-cased before lookup, the same way better-auth stores them.
- `--revoke` doesn't require a verified email. Only promoting does.
- Sessions aren't revoked on demotion. `requireAdmin` (T-05) reads the role from a fresh session lookup, so a demoted admin loses access on their next request.
