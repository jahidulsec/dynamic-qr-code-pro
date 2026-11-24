# T-25: Admin users

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 4: Panel polish | M | [04](../../specs/04-admin-panel.md) | [T-07](../01-admin-access/T-07-admin-shell.md), [T-14](../04-admin-panel/T-14-audit-plumbing-for-admin-actions.md) |

- `/admin/users`: list with search, plus Ban (reason and expiry), Unban and Revoke sessions, each through `auth.api` and audited.
- Banning yourself or a superadmin is refused on the server and hidden in the UI.

**Done when**
- [ ] A banned user is signed out everywhere and can't sign in until the ban expires or is lifted.

**Notes**
- **Audit and `auth.api` in one transaction.** better-auth writes through its own adapter connection, so `auth.api.banUser` / `unbanUser` / `revokeUserSessions` can't join a Prisma transaction. Each service in `features/admin/services/manage-users.ts` opens `prisma.$transaction`, re-reads the target, checks the rules, writes the admin audit entry, and then calls `auth.api` inside the callback. If better-auth throws, the entry rolls back. The only remaining gap is a failed COMMIT after better-auth has succeeded. The transaction doesn't lock the target's rows, because better-auth's update would then wait on it.
- **Revoke sessions is refused for yourself**, which would end the admin's own session. The spec only restricts Ban. Revoking another superadmin's sessions is allowed.
- **An expired ban reads as no ban.** The admin plugin leaves `banned = true` after `banExpires` and clears it at the user's next sign-in. The list shows such users as not banned and offers Ban again.
- **The ban reason is required**, using the review-reason bounds (3–500 characters). It's recorded in the admin audit entry with the expiry.
- **The "Done when" box is verified by code path only.** `banUser` sets `banned` and deletes every session row. Cookie cache is off, so the next request from any device finds no session. The plugin's `session.create` hook refuses sign-in while the ban is active and auto-unbans once it expires. It wasn't exercised at runtime because the configured database couldn't be confirmed as local.
