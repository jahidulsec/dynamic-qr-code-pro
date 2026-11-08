# Admin, organization approval and subscriptions: specs

These specs describe the platform admin panel, the review process for new organizations, and plan-based subscriptions. They are written against the current codebase: better-auth with the organization plugin, `requireMembership` / `requirePermission` in `features/organizations`, and the `features/*` module rules in `.claude/rules/features.md`.

| # | Spec | Summary |
| --- | --- | --- |
| 01 | [Admin access](01-admin-access.md) | Platform admins, `/admin/login`, the `/admin` guard, creating the first admin |
| 02 | [Organization approval](02-organization-approval.md) | New organizations start as pending; an admin approves, rejects, suspends or reactivates them; owners are notified by email |
| 03 | [Plans and subscriptions](03-plans-and-subscriptions.md) | Plan catalogue, one subscription per organization, entitlements and the limits they enforce |
| 04 | [Admin panel](04-admin-panel.md) | Dashboard, organizations, plans, users and the admin audit log |
| — | [Tickets](../tickets/README.md) | Spec analysis findings and an index of the 27 tickets, one file each |

## Glossary

- **Admin.** A platform operator: a `user` whose `role` is `superadmin`. This is not the same as the organization role `admin` stored in `member.role`. The two never mix.
- **Owner.** A member whose `member.role` includes `owner`. Owners receive the organization's status and billing emails.
- **Effective plan.** The plan whose limits apply to an organization right now (see spec 03).

## Decisions

These decisions are made, but each one can be changed. Any change goes back into the spec it affects.

1. **Billing is manual.** An admin assigns plans and sets period end dates, and no payment provider is used yet. The `Subscription` model has `provider` and `externalId` so Stripe can be added later without a schema change.
2. **Pending organizations are fully locked.** Before approval the owner can't create QR codes, invite members or change settings. They can only see the status screen and withdraw the request.
3. **Billing never breaks printed codes.** When a subscription expires or is canceled, the organization falls back to the default plan's limits, and existing QR codes keep redirecting. Only a **suspension** stops redirects.
4. **There is one admin role, `superadmin`.** Narrower roles such as support or billing can be added later through the admin plugin's access control.
5. **Status is worked out when it's read, not by a scheduled job.** An expired subscription is detected by comparing `currentPeriodEnd` with the current time, so v1 needs no cron. Reminder emails, which do need a schedule, are out of scope.

## Delivery phases

| Phase | Specs | What ships |
| --- | --- | --- |
| 1. Foundation | 01, schema changes from 02 and 03 | Migration, admin plugin, bootstrap script, `/admin/login`, guarded `/admin` shell |
| 2. Approval | 02, 04 (organizations) | Pending flow, review queue and detail page, approve/reject/suspend/reactivate, emails, enforcement |
| 3. Plans and subscriptions | 03, 04 (plans, subscription panel) | Plan CRUD, subscription controls, entitlements replacing `QR_QUOTA`, the org billing page |
| 4. Polish | 04 (dashboard, users, audit log) | Stats, user ban and session revoke, admin audit log page |

## Open questions

- **Plans for existing organizations.** Today every organization gets `QR_QUOTA = 500`. Spec 03 proposes giving existing organizations a Pro subscription (500 QR codes) with no end date, so nobody loses capacity. Is that right?
- **Default plan limits.** The seeded Free, Pro and Business limits and prices in spec 03 are placeholders.
- **Admin notification address.** Spec 02 emails new requests to `ADMIN_NOTIFY_EMAILS` when it is set. Should admins also receive these emails, or only see them in the panel?
- **Admin 2FA.** Requiring TOTP for admins is recommended but isn't in v1. Should it move into phase 1?
