# T-11: Status screen inside `/<slug>`

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | M | [02](../../specs/02-organization-approval.md) | [T-09](../02-organization-approval/T-09-server-side-enforcement-for-orgs-that-aren-t-active.md), [T-10](../02-organization-approval/T-10-org-list-status-rows-request-notice-withdraw.md) |

- `OrganizationShell`: when a member opens an org that isn't active, render `OrganizationStatusScreen` instead of the sidebar and children:
  - waiting for approval
  - not approved, with the reason and Withdraw
  - suspended, with the reason and the support contact
- Non-members still get `notFound()`.

**Done when**
- [x] `/<pending>`, `/<pending>/settings/members` and `/<pending>/reports` all show the waiting screen.
- [x] A non-member gets a 404.

**Notes**
- `OrganizationShell` returns `OrganizationStatusScreen` before the sidebar loaders and never renders `children`. Every nested segment (`settings/layout.tsx`, `reports`, `tags`, …) sits under that layout, so they all show the same screen. Non-members hit `notFound()` from `getAccess`, which still runs before the status check. Both boxes were verified by code path, not against a database (the dev DB isn't local).
- For a non-owner member, the pending screen says "We'll email the organization's owners" instead of showing an owner's address.
- `WithdrawRequestButton` takes an optional `redirectTo`. On the status screen it goes to `/organizations` after a withdraw, so the refreshed route doesn't land on a 404.
- `next build` currently fails prerendering `/[organizationSlug]/settings` (`usePathname()` in `NavigationProgress` outside `<Suspense>`). The failure was there before this change and also happens without it.
