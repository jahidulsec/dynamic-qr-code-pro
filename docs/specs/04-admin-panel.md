# 04: Admin panel

The screens under `/admin`. Every page and loader here calls `requireAdmin()` (spec 01). Lists are paginated on the server, with URL search params for `page`, `size`, `q` and filters, following the `features/qr` list pattern.

## Dashboard: `/admin`

**Stat tiles.** Each tile links to the filtered list behind it.

| Tile | Value | Links to |
| --- | --- | --- |
| Pending requests | count of PENDING orgs | `/admin/organizations?status=pending` |
| Active organizations | count of ACTIVE orgs | `?status=active` |
| Users | total users, plus "+{n} this week" | `/admin/users` |
| QR codes | live (not trashed) QR codes across all orgs | — |
| Scans (30 days) | `qr_scan` rows in the last 30 days | — |
| Expiring soon | subscriptions with `currentPeriodEnd` in the next 7 days | `/admin/organizations?expiring=7` |

**Below the tiles:**

- **Pending requests:** the 5 oldest pending requests, showing the name, slug, requester, submission date, and **Review** and **Reject** buttons.
- **Recent admin activity:** the latest 10 admin audit entries.

Counts are read with `{ cache: false }`, because the dashboard is the review queue's entry point and must never show a stale count.

## Organizations: `/admin/organizations`

**Filters:**

- status tabs: Pending (default when there are any), Active, Suspended, Rejected and All, each with a count
- search by name or slug
- plan
- expiring within 7 days

**Table columns:**

- name and slug
- owner (name and email)
- status badge
- plan, with its state (Active, Trial, Expired, Canceled)
- QR code count
- member count
- created date

Clicking a row opens the detail page. On the Pending tab, the rows are sorted oldest first.

## Organization detail: `/admin/organizations/[id]`

| Section | Content |
| --- | --- |
| Header | Name, `/<slug>`, status badge, created date. Actions depend on the status: **Approve**, **Reject**, **Suspend** or **Reactivate** (spec 02 transitions). |
| Status | `statusReason`, reviewed by and when. |
| Owners and members | The member list, with roles and emails. Read-only. |
| Usage | QR codes (live and trashed), members, pending invitations, custom roles, and scans in the last 30 days, each compared with the plan limit. |
| Subscription | Plan, state, interval, period start and end, provider, and internal notes. Actions: **Change plan**, **Extend** (+1 month, +1 year, or until a date), **Cancel**. |
| History | Admin audit entries for this organization. |

**Dialogs:**

- **Approve:** plan select (active, unarchived plans, with the default preselected), status (Active or Trial), and an optional period end date. Confirm button: "Approve and send activation email".
- **Reject** and **Suspend:** a required reason (3–500 characters) with the hint "Shown to the organization's owners". The suspend dialog also warns: "All of this organization's QR codes will stop redirecting."
- **Change plan:** the `setSubscriptionAction` fields. An "Email owners about this change" checkbox is on by default.
- **Cancel subscription:** a confirmation that the org falls back to {default plan} limits at once.

## Plans: `/admin/plans` and `/admin/plans/[id]`

- **List:** plan cards or rows in `sortOrder`, each showing the name, key, prices, limits, feature checks, a default badge, an archived badge, and "{n} organizations".
- **Create and edit form:** name, key (create only), description, monthly and yearly price, currency, the three limits (each with an "Unlimited" toggle), feature checkboxes, public, and sort order.
- **Row actions:** Set as default, Archive or Unarchive. The default plan has no Archive action.
- **Editing an in-use plan** shows a warning: "Changes apply immediately to {n} organizations."

## Users: `/admin/users`

**Table columns:**

- name and email, with a verified badge
- platform role (`user` or `superadmin`)
- organizations count
- created date
- banned badge, with the ban's expiry

Search covers name and email.

**Row actions:**

- **Ban:** a reason, plus an optional expiry (1 day, 7 days, 30 days, or never). This calls `auth.api.banUser`, which also revokes the user's sessions.
- **Unban**
- **Revoke sessions:** signs the user out everywhere.

**Rules:**

- An admin can't ban themselves or another superadmin. Those actions are hidden in the UI and refused on the server.
- The platform role can't be changed from the panel in v1 (spec 01 bootstrap script only).

## Audit log: `/admin/audit-log`

```prisma
model AdminAuditLog {
  id          String   @id @default(cuid())
  actorId     String?
  actor       User?    @relation("AdminAuditActor", fields: [actorId], references: [id], onDelete: SetNull)
  actorName   String   @db.VarChar(255)  // kept when the admin account is deleted
  action      String   @db.VarChar(64)   // see list below
  targetType  String   @db.VarChar(32)   // "organization" | "subscription" | "plan" | "user"
  targetId    String   @db.VarChar(191)
  targetLabel String   @db.VarChar(255)  // name at the time
  metadata    Json?                      // { from, to, reason, … }
  createdAt   DateTime @default(now())

  @@index([createdAt])
  @@index([targetType, targetId, createdAt])
  @@index([actorId])
  @@map("admin_audit_log")
}
```

**Actions:**

- `organization.approve`, `organization.reject`, `organization.suspend`, `organization.reactivate`
- `subscription.set`, `subscription.extend`, `subscription.cancel`
- `plan.create`, `plan.update`, `plan.archive`, `plan.unarchive`, `plan.default`
- `user.ban`, `user.unban`, `user.sessions.revoke`

They are listed in a client-safe `ADMIN_AUDIT_ACTIONS` map, like the existing `AUDIT_ACTIONS`, which also holds each action's display phrase.

- The page filters by action, actor and target type, sorts newest first, and pages at 50 entries.
- Each row reads as a sentence, for example "**Jahid** approved the organization **Acme**" followed by the time and a details line ("Plan: Pro", "Reason: …").
- Entries are written in the **same transaction** as the change they record. The log is append-only and nothing in the panel deletes entries.

## Module layout

```
features/admin/
  index.ts                 client-safe: components, actions, schemas, ADMIN_AUDIT_ACTIONS
  server.ts                getAdminSession, requireAdmin, page-level server components
  constants.ts             page sizes, reason length bounds
  schemas/                 review-schema.ts, user-action-schema.ts, admin-query-schema.ts
  services/admin-audit-log.ts
  libs/admin-audit.ts      writeAdminAudit(tx, entry)
  libs/admin-stats.ts      "use server" dashboard loader
  libs/admin-organizations.ts, admin-users.ts   "use server" list/detail loaders
  actions/admin-sign-in.ts, review-organization.ts, manage-subscription.ts, manage-plans.ts, manage-users.ts
  components/              admin-sidebar, stat-tiles, organization-table, organization-detail,
                           review dialogs, plan-form, user-table, admin-audit-table, admin-login-form
```

- Add the cache tags `adminAuditLogs` and `adminAuditLogCount`.
- Admin reads that span organizations go through services that are **not** organization-scoped. They must only be reachable through loaders that call `requireAdmin()`.

## Acceptance criteria

- [ ] The dashboard's pending count matches the Pending tab and updates straight after an approval, with no stale cache.
- [ ] Every admin action writes exactly one admin audit entry, in the same transaction as its change.
- [ ] An admin can't ban themselves or another superadmin, even by calling the action directly.
- [ ] A banned user is signed out of every session and can't sign in until the ban expires or is lifted.
- [ ] All lists keep their filters and page in the URL, and the back button restores them.
- [ ] Every page works at phone width, with tables scrolling inside their card rather than the page.
