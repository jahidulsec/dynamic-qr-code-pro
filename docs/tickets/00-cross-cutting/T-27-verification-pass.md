# T-27: Verification pass

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 4: Panel polish | S | all | everything above |

- Run `npm run lint`, `npx tsc --noEmit` and `npx next build`.
- Walk through every acceptance checklist in specs 01–04, and update the specs with F1–F13.

**Done when**
- [ ] All three commands pass, and every acceptance box in the specs is ticked or has a ticket for it.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F1 | **Admin sign-in leaves a session behind for non-admins.** `signInEmail` sets the session cookie through `nextCookies()` before the action can see the role, so "sign out immediately" has to revoke the token and clear the cookie. If the person was already signed in as someone else, that session's cookie is overwritten. | High | Before calling `signInEmail`, look the email up. If the user isn't a non-banned `superadmin`, return one generic error, "Invalid email or password, or this account doesn't have admin access", without creating a session. This replaces the spec's "sign out after sign-in" step. | T-06 |
| F13 | **New relations need back-relations.** `reviewedBy`, `AdminAuditLog.actor` and `Organization.subscription` need named back-relations on `User` and `Organization`, or the Prisma schema won't validate. | Low | Add them in the schema change. | T-01 |
