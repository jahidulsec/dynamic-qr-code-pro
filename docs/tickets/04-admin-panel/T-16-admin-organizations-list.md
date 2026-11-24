# T-16: Admin organizations list

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | M | [04](../../specs/04-admin-panel.md) | [T-07](../01-admin-access/T-07-admin-shell.md) |

- `/admin/organizations`:
  - status tabs with counts, plus search, plan and expiring filters, all kept in URL params
  - the columns from spec 04
  - pending rows sorted oldest first
- `"use server"` loader in `features/admin/libs/admin-organizations.ts`, which calls `requireAdmin` and reads fresh.

**Done when**
- [x] Filters and the page number survive reloads and the back button.
- [x] Tables scroll inside their card at phone width.

**Notes**
- `getAdminOrganizations(searchParams)` takes the raw URL params and parses them with `adminOrganizationsSearchParamsSchema`. Bad values fall back to defaults instead of failing the page. Every read uses `{ cache: false }`.
- With no `status` in the URL, the list opens on Pending if anything is pending, otherwise on All. Tab links always write `status`, so a reload keeps the tab even after the queue empties. Tab counts follow the current search, plan and expiring filters, so with no filters set the Pending count matches the sidebar badge.
- Tabs and the expiring toggle are links, so each change adds a history entry. Search (`SearchInput`) and plan (`Select` with `paramKey`) replace the current entry, as the QR list does. Pagination pushes.
- The plan filter matches the plan on the organization's subscription. Organizations with no subscription show the default plan's name with a "No subscription" badge, and appear only under All plans.
- Plan state comes from a local `planState()` in `libs/admin-organization-query.ts` that follows spec 03's table. Once T-18 lands, it can switch to `resolveEntitlements`.
- Owner: members whose role contains "owner" are read, up to 5, and `isOwnerRole` picks the first exact match.
- Rows link to `/admin/organizations/[id]`, which T-17 builds.
- Both boxes were checked in headless Chrome against the dev server, with 30 temporary organizations and an admin seeded into the dev DB and removed afterwards. Reload and back/forward keep the tab, page, expiring, search and plan. At 375px the table scrolls inside its card (343px wide, 983px of content) and the page stays 375px wide. After a reload, Back to an earlier entry refetches it, so in dev the old tab can show for up to a second before the new one renders.
