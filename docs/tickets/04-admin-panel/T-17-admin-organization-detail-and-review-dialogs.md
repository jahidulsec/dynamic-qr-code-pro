# T-17: Admin organization detail and review dialogs

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | L | [04](../../specs/04-admin-panel.md) | [T-15](../02-organization-approval/T-15-review-actions.md), [T-16](../04-admin-panel/T-16-admin-organizations-list.md) |

- `/admin/organizations/[id]`, with sections for:
  - the header, with the actions allowed for the current status
  - status
  - members
  - usage
  - the subscription (read-only until T-22)
  - history
- Approve dialog (plan select defaulting to the default plan, status, period end), plus the Reject and Suspend dialogs, using `useTransition` and toasts.

**Done when**
- [x] An admin can review a request end to end, and the status, history and dashboard counts update without a reload.

**Notes**
- **What was added:**
  - The page is `app/admin/(panel)/organizations/[id]/page.tsx`.
  - Its loader, `getAdminOrganization(id)`, is in `libs/admin-organizations.ts`. It calls `requireAdmin` and reads everything with `{ cache: false }`. For an unknown or malformed id it returns `data: null`, and the page calls `notFound()`. This is so the page doesn't have to match an error message.
  - New private services: `getOrganization`, `services/admin-audit-log.ts`, `services/qr-code.ts` and `services/qr-scan.ts`.
  - T-18 left a follow-up: `features/admin/services/plan.ts` duplicated billing's `getPlans`. It's deleted, and admin now reads plans through `@/features/billing/server`.
- **Usage** compares counts against the plan in effect (`getEntitlements`), the same way the limit checks count:
  - QR codes outside the trash, with the trashed count as a hint
  - members plus pending, unexpired invitations
  - custom roles
  - scans in the last 30 days, shown as a plain number because no plan limits them
- **The bar component is shared.** `UsageBar` is now exported from `@/features/billing`, so the admin page and the billing page use the same one.
- **History** lists the latest 50 admin audit entries whose `targetId` is the organization and whose `targetType` is `organization` or `subscription`. T-22 should write subscription entries with `targetId = organizationId` so they show up here. Metadata appears as one line, such as "PENDING → ACTIVE · Plan: Pro".
- **Approve dialog:**
  - The plan select lists plans that aren't archived, with the default preselected. The hidden `legacy` plan isn't archived, so it can be chosen.
  - The period end is a date input. It's sent as the end of that day in the admin's time zone, so a plan that "ends on the 5th" still covers the 5th.
- **Dialogs:** reject and suspend share one dialog, `ReviewReasonDialog`. Reactivate uses a confirm. Every dialog runs its action in `useTransition`, shows a toast, and stays open while the action is running.
- **No reload needed:** the review actions' `refresh()` re-renders the detail page (header actions, status and history) and the panel layout, which holds the sidebar's pending badge. The dashboard is still a placeholder until T-24, so "dashboard counts" here means that badge and the list's tab counts.
- **Verification:**
  - `tsc` passes.
  - `npm run lint` and `next build` fail only on the errors that were already there. These are `hooks/use-mobile.ts`, and the `usePathname` prerender error in `progress-bar.tsx`.
  - Signed out, `/admin/organizations/<id>` redirects to `/admin/login`. An unknown id renders the 404 page.
  - During T-22, a throwaway admin session and organization were created in the dev DB, then deleted. With that session, the page rendered every section.
    - The header actions matched the status. A PENDING org showed Approve and Reject, and an ACTIVE org showed Suspend.
    - History lines rendered from the admin audit log.
  - The approve transition was run through `reviewOrganization`.
  - Browser check (headless Chrome against the dev server, with a throwaway admin and a PENDING organization seeded into the dev DB and removed afterwards):
    - The path was Reject (an empty reason shows the field error) → Approve from REJECTED (Free preselected as the default, a period end set) → Suspend → Reactivate.
    - After each action a toast showed, the dialog closed, and the header actions, status badge and history row updated in place.
    - The sidebar's pending badge went from 1 to none after the reject.
    - A `window` marker set before an action was still there afterwards, so the page wasn't reloaded. There were no console errors.
    - The stored period end was 23:59:59.999 local time on the chosen day.
- **In dev, signed out,** both admin list routes log "`new Date()` while prerendering". It comes from `utils/logger.ts`, which stamps a time in the `apiResponse.error` path. The list page did this before T-17.
