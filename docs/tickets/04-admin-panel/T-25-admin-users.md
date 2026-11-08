# T-25: Admin users

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 4: Panel polish | M | [04](../../specs/04-admin-panel.md) | [T-07](../01-admin-access/T-07-admin-shell.md), [T-14](../04-admin-panel/T-14-audit-plumbing-for-admin-actions.md) |

- `/admin/users`: list with search, plus Ban (reason and expiry), Unban and Revoke sessions, each through `auth.api` and audited.
- Banning yourself or a superadmin is refused on the server and hidden in the UI.

**Done when**
- [ ] A banned user is signed out everywhere and can't sign in until the ban expires or is lifted.
