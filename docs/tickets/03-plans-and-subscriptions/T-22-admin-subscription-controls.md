# T-22: Admin subscription controls

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 3: Plans and subscriptions | M | [03](../../specs/03-plans-and-subscriptions.md), [04](../../specs/04-admin-panel.md) | [T-17](../04-admin-panel/T-17-admin-organization-detail-and-review-dialogs.md), [T-18](../03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |

- `setSubscriptionAction`, `extendSubscriptionAction` and `cancelSubscriptionAction`, each writing an audit entry with the before and after values.
- `subscriptionChangedEmail`, sent on a plan change when "Email owners" is ticked.
- The subscription section on the detail page, with the Change plan, Extend and Cancel dialogs.

**Done when**
- [x] Extending an expired subscription restores its plan straight away, and canceling moves the org to Free limits straight away.
- [x] Archived plans can't be selected.

**Notes**
- **Where things live:**
  - The actions are in `features/admin/actions/manage-subscription.ts`.
  - Each transaction, and the audit entry written inside it, is in `services/manage-subscription.ts`. That file follows the same pattern as `review-organization.ts`.
  - Audit entries use `targetType: "subscription"` with `targetId` set to the organization's id, so they show in the org's history on the detail page (T-17). Their `targetLabel` is the org's name.
- **`setSubscriptionAction(organizationId, values, { emailOwners })`:**
  - `values` is validated with billing's `subscriptionFormSchema`. "Email owners" is a separate option rather than part of the subscription form. It defaults to on.
  - Archived plans are refused inside the transaction. The plan selects also list only plans that aren't archived.
  - `canceledAt` is cleared, so setting a plan on a canceled subscription starts it again.
  - Audit metadata is `{ before, after }`, two full snapshots: plan, status, interval, period, `canceledAt` and notes. `before` is null when the row is new.
  - **Added:** it refuses PENDING and REJECTED organizations with "Approve the organization before changing its plan". Approval creates the first subscription, and a row that already existed would make the approval fail.
- **`subscriptionChangedEmail`** is sent after the commit, and only when the plan itself changes and "Email owners" is ticked. It shows the end date or "no end date", and links to `/<slug>/settings/billing`. Like the other emails, a failed send is logged and never fails the action.
- **`extendSubscriptionAction(id, { by: "month" | "year" } | { until })`:**
  - It extends from whichever is later, now or the current end. Months are clamped to the month's last day.
  - The write only applies if the status and end date are still the ones read inside the transaction. So two admins extending at once can't both count from the same end: the second one gets "The subscription was changed by someone else. Reload and try again."
  - No email is sent.
  - **Added:** it refuses three cases:
    - a canceled subscription: use Change plan instead
    - a subscription with no end date: there's nothing to extend, and adding a date would shorten it
    - an `until` that isn't after both today and the current end
- **`cancelSubscriptionAction(id, { reason? })`:**
  - It sets CANCELED and `canceledAt` to now, so the default plan applies straight away.
  - The optional reason goes only into the admin audit log.
  - It refuses a subscription that's already canceled.
  - No email is sent, since the spec names emails only for plan changes.
- **Dialogs** live in the subscription section:
  - Change plan, or "Set plan" when there's no live subscription.
  - Extend, shown only when there's an end date. It offers +1 month, +1 year, or until a date.
  - Cancel, which confirms that the org falls back to {default plan} limits.
  - For PENDING and REJECTED orgs, the section shows "Approve the organization to set its plan." instead.
  - Date inputs are sent as the start or end of that day in the admin's time zone.
- **History lines:** `describeAdminAuditMetadata` now also reads `before`/`after` snapshots, for example "Pro → Business · ACTIVE · No end date". ISO timestamps are shown as dates.
- **Verification:**
  - A throwaway script ran the services against the dev DB, with `next/cache` stubbed. It created an admin, an owner, a PENDING org and an archived plan, then deleted all of them.
  - The script passed 23 checks. Among them:
    - setting a plan is refused before approval
    - an archived plan is refused, and the plan doesn't change
    - an end date of yesterday gives "expired" on Free limits
    - +1 month restores Pro straight away, counting from now
    - +1 year counts from the current end
    - two concurrent extends give one success and one conflict
    - canceling moves the org to Free at once, and a 26th QR code is refused
    - extending or canceling an already-canceled subscription is refused
    - setting a plan after canceling clears `canceledAt`
    - there's exactly one audit entry per successful write
    - the email escapes HTML and links to the billing page
  - With a signed-in admin session, the dev server rendered the detail page: the subscription actions, the state badge, and history lines such as "Business → Pro". It hid the actions for a PENDING org.
  - The dialogs weren't clicked through in a browser. Owner email delivery wasn't checked either, since there's no SMTP here.
  - `tsc` passes. `npm run lint` and `next build` fail only on the errors that were already there: `hooks/use-mobile.ts`, and the `usePathname` prerender error in `progress-bar.tsx`.
