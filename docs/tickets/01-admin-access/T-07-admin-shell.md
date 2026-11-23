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
- [x] Every `/admin/*` route redirects when signed out and renders the shell for an admin.
- [x] It works at phone width.

**Notes**
- The pending badge comes from a new `"use server"` loader, `getPendingOrganizationCount` (`features/admin/libs/admin-organizations.ts`). It calls `requireAdmin()` and counts `PENDING` orgs through a private, not organization-scoped `features/admin/services/organization.ts` with `{ cache: false }`. T-16 can add its list loader to the same file. The badge is hidden at 0.
- `features/admin` now exports `AdminSidebar`, `AdminPageHeader`, `AdminPlaceholder`, `getPendingOrganizationCount` and `ADMIN_PAGE_TITLES`. `ADMIN_PATHS` and `APP_HOME_PATH` (`/organizations`) stay private in `constants.ts`.
- The layout's title template is `%s · Admin | <site name>`. A template doesn't reach the page in its own segment, so `/admin` sets no title and gets the layout's `default`, "Admin" (shown as "Admin | <site name>").
- Signed-out users and signed-in non-admins are both redirected to `/admin/login`, which already tells them apart (T-06).
- Verified against the dev server:
  - Signed out, all five routes streamed a redirect to `/admin/login` with `noindex, nofollow`.
  - With a temporary superadmin session (created for the test and removed afterwards), all five routes rendered the shell with the right heading and title.
  - At 390px there was no horizontal scroll (`scrollWidth` equals the viewport), and the sidebar trigger opened the sheet with every nav item, Back to app and Sign out.
  - **Sign out** revoked the session and landed on `/admin/login`.
- The badge with a non-zero count wasn't seen, because the database has no pending orgs.
- `npx next build` fails on `/[organizationSlug]/settings/*`, where `NavigationProgress` (in the root layout) calls `usePathname()` outside `<Suspense>`. It fails the same way with the admin routes removed, so this was already broken and isn't part of this ticket. `npm run lint` reports one existing error in `hooks/use-mobile.ts`.
