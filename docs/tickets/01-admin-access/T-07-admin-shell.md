# T-07: Admin shell

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 1: Foundation | M | [01](../../specs/01-admin-access.md), [04](../../specs/04-admin-panel.md) | [T-05](../01-admin-access/T-05-features-admin-scaffold-and-guard.md) |

- `app/admin/(panel)/layout.tsx`: a `getAdminSession()` guard that redirects to `/admin/login`, plus `noindex`.
- `AdminSidebar`:
  - links to Dashboard, Organizations (with the pending count badge), Plans, Users and Audit log
  - footer with the admin's identity, **Back to app**, and **Sign out** (which goes to `/admin/login`)
- Placeholder pages for each nav item. Later tickets replace them.

**Done when**
- [ ] Every `/admin/*` route redirects when signed out and renders the shell for an admin.
- [ ] It works at phone width.
