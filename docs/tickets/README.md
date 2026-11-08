# Tickets: admin, approval and subscriptions

These tickets are cut from specs [01](../specs/01-admin-access.md) to [04](../specs/04-admin-panel.md). Each ticket can be merged on its own and leaves the app working. Sizes: **S** is under half a day, **M** is about a day, **L** is two days or more.

## Folders

Each ticket is filed under the spec it mainly delivers. Tickets that span every spec are in `00-cross-cutting`.

| Folder | Spec | Tickets |
| --- | --- | --- |
| [00-cross-cutting/](00-cross-cutting/) | all | T-01, T-02, T-27 |
| [01-admin-access/](01-admin-access/) | [01](../specs/01-admin-access.md) | T-03, T-04, T-05, T-06, T-07 |
| [02-organization-approval/](02-organization-approval/) | [02](../specs/02-organization-approval.md) | T-08, T-09, T-10, T-11, T-12, T-13, T-15 |
| [03-plans-and-subscriptions/](03-plans-and-subscriptions/) | [03](../specs/03-plans-and-subscriptions.md) | T-18, T-19, T-20, T-21, T-22, T-23 |
| [04-admin-panel/](04-admin-panel/) | [04](../specs/04-admin-panel.md) | T-14, T-16, T-17, T-24, T-25, T-26 |

---

## Spec analysis

I checked the specs against the current code. The findings below are folded into the tickets, and the specs should be updated to match them.

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F1 | **Admin sign-in leaves a session behind for non-admins.** `signInEmail` sets the session cookie through `nextCookies()` before the action can see the role, so "sign out immediately" has to revoke the token and clear the cookie. If the person was already signed in as someone else, that session's cookie is overwritten. | High | Before calling `signInEmail`, look the email up. If the user isn't a non-banned `superadmin`, return one generic error, "Invalid email or password, or this account doesn't have admin access", without creating a session. This replaces the spec's "sign out after sign-in" step. | T-06 |
| F2 | **Admins' personal names would show up in customers' audit logs.** Spec 02 writes approve and suspend entries to the org `AuditLog` with the admin as the actor. | Medium | Org-side entries use `actorId = null` and `actorName = "Platform team"`. The real admin is recorded only in `AdminAuditLog`. | T-14 |
| F3 | **The member limit can be bypassed with old invitations.** The limit is checked when someone is invited, but not when an invitation is accepted. Invitations sent before a downgrade can push the org over its limit. | Medium | `beforeAcceptInvitation` also checks `members < limits.members`. | T-19 |
| F4 | **CSV export is a loader, not an action.** CSV comes from loaders in `features/qr/libs/qr.ts` and `features/reports/libs/reports.ts`. Spec 03 calls it "CSV export action". | Low | Gate both loaders. | T-20 |
| F5 | **A trial can have no end date.** `TRIALING` with `currentPeriodEnd = null` never expires. | Low | Validation: `TRIALING` requires `currentPeriodEnd`. | T-18 |
| F6 | **The Pro backfill can take capacity away from existing orgs.** They can create up to 20 custom roles today (`MAX_CUSTOM_ROLES`), but seeded Pro allows 5. Orgs that already have more than 5 lose the ability to add roles. | Medium | **Needs a decision:** seed Pro with `maxCustomRoles = 20`, or backfill existing orgs onto a hidden `legacy` plan (500 QR codes, unlimited members, 20 roles). I recommend `legacy`. | T-01 |
| F7 | **The migration needs fixed ids for seeded rows.** Plain SQL can't call `cuid()`. | Low | Seed plans with fixed ids (`plan_free`, `plan_pro`, …), and backfill subscriptions with `CONCAT('sub_', organization.id)`. | T-01 |
| F8 | **There's no support contact anywhere.** Emails and the billing page say "contact support", but `siteConfig` has no support address. | Low | Add a `SUPPORT_EMAIL` env var, exposed through `siteConfig.supportEmail`. | T-02 |
| F9 | **`listOrganizations` may not return the new fields.** It isn't confirmed that better-auth includes `additionalFields` in `listOrganizations`. | Low | Check this first. If it doesn't, read `id → status, statusReason, createdAt` with Prisma for the listed ids. | T-10 |
| F10 | **The phases depend on each other.** Approval (phase 2) creates a subscription, which needs plans that phase 3 manages. | Low | Plans are seeded in the phase 1 migration. `QR_QUOTA` stays in force until T-19, so there's no gap in limits. | T-01, T-15 |
| F11 | **"Expiring soon" is loosely defined.** It would include canceled subscriptions. | Low | Count only rows with status `TRIALING` or `ACTIVE` and a non-null `currentPeriodEnd` between now and now + 7 days. | T-24 |
| F12 | **One acceptance criterion contradicts another rule.** Spec 01 says "a banned admin is refused at the next request", but spec 04 forbids banning a superadmin. | Low | Keep the `banned` check in `requireAdmin`, since a superadmin can still be banned directly in the database. Change the criterion to "a superadmin with `banned = true` (set via DB) is refused". | T-05 |
| F13 | **New relations need back-relations.** `reviewedBy`, `AdminAuditLog.actor` and `Organization.subscription` need named back-relations on `User` and `Organization`, or the Prisma schema won't validate. | Low | Add them in the schema change. | T-01 |

---

## Index


### Phase 1: Foundation

| Ticket | Title | Folder | Size | Depends on |
| --- | --- | --- | --- | --- |
| [T-01](00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md) | Schema migration for status, plans, subscriptions, admin audit log and admin fields | `00-cross-cutting` | L | none |
| [T-02](00-cross-cutting/T-02-env-config-and-cache-tags.md) | Env, config and cache tags | `00-cross-cutting` | S | none |
| [T-03](01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md) | better-auth: admin plugin, org status fields, HTTP lock | `01-admin-access` | M | [T-01](00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md) |
| [T-04](01-admin-access/T-04-bootstrap-script-admin-create.md) | Bootstrap script `admin:create` | `01-admin-access` | S | [T-03](01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md) |
| [T-05](01-admin-access/T-05-features-admin-scaffold-and-guard.md) | `features/admin` scaffold and guard | `01-admin-access` | S | [T-03](01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md) |
| [T-06](01-admin-access/T-06-admin-login.md) | `/admin/login` | `01-admin-access` | M | [T-05](01-admin-access/T-05-features-admin-scaffold-and-guard.md) |
| [T-07](01-admin-access/T-07-admin-shell.md) | Admin shell | `01-admin-access` | M | [T-05](01-admin-access/T-05-features-admin-scaffold-and-guard.md) |

### Phase 2: Organization approval

| Ticket | Title | Folder | Size | Depends on |
| --- | --- | --- | --- | --- |
| [T-08](02-organization-approval/T-08-pending-organization-creation.md) | Pending organization creation | `02-organization-approval` | M | [T-03](01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md), [T-13](02-organization-approval/T-13-status-email-templates.md) |
| [T-09](02-organization-approval/T-09-server-side-enforcement-for-orgs-that-aren-t-active.md) | Server-side enforcement for orgs that aren't active | `02-organization-approval` | M | [T-03](01-admin-access/T-03-better-auth-admin-plugin-org-status-fields-http-lock.md) |
| [T-10](02-organization-approval/T-10-org-list-status-rows-request-notice-withdraw.md) | Org list: status rows, request notice, withdraw | `02-organization-approval` | M | [T-09](02-organization-approval/T-09-server-side-enforcement-for-orgs-that-aren-t-active.md) |
| [T-11](02-organization-approval/T-11-status-screen-inside-slug.md) | Status screen inside `/<slug>` | `02-organization-approval` | M | [T-09](02-organization-approval/T-09-server-side-enforcement-for-orgs-that-aren-t-active.md), [T-10](02-organization-approval/T-10-org-list-status-rows-request-notice-withdraw.md) |
| [T-12](02-organization-approval/T-12-stop-qr-redirects-for-suspended-orgs.md) | Stop QR redirects for suspended orgs | `02-organization-approval` | S | [T-01](00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md) |
| [T-13](02-organization-approval/T-13-status-email-templates.md) | Status email templates | `02-organization-approval` | M | [T-02](00-cross-cutting/T-02-env-config-and-cache-tags.md) |
| [T-14](04-admin-panel/T-14-audit-plumbing-for-admin-actions.md) | Audit plumbing for admin actions | `04-admin-panel` | S | [T-01](00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md), [T-05](01-admin-access/T-05-features-admin-scaffold-and-guard.md) |
| [T-15](02-organization-approval/T-15-review-actions.md) | Review actions | `02-organization-approval` | L | [T-09](02-organization-approval/T-09-server-side-enforcement-for-orgs-that-aren-t-active.md), [T-13](02-organization-approval/T-13-status-email-templates.md), [T-14](04-admin-panel/T-14-audit-plumbing-for-admin-actions.md) |
| [T-16](04-admin-panel/T-16-admin-organizations-list.md) | Admin organizations list | `04-admin-panel` | M | [T-07](01-admin-access/T-07-admin-shell.md) |
| [T-17](04-admin-panel/T-17-admin-organization-detail-and-review-dialogs.md) | Admin organization detail and review dialogs | `04-admin-panel` | L | [T-15](02-organization-approval/T-15-review-actions.md), [T-16](04-admin-panel/T-16-admin-organizations-list.md) |

### Phase 3: Plans and subscriptions

| Ticket | Title | Folder | Size | Depends on |
| --- | --- | --- | --- | --- |
| [T-18](03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) | `features/billing` scaffold and entitlements | `03-plans-and-subscriptions` | M | [T-01](00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md), [T-02](00-cross-cutting/T-02-env-config-and-cache-tags.md) |
| [T-19](03-plans-and-subscriptions/T-19-enforce-plan-limits-remove-qr-quota.md) | Enforce plan limits, remove `QR_QUOTA` | `03-plans-and-subscriptions` | M | [T-18](03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |
| [T-20](03-plans-and-subscriptions/T-20-gate-features-by-plan.md) | Gate features by plan | `03-plans-and-subscriptions` | M | [T-18](03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |
| [T-21](03-plans-and-subscriptions/T-21-org-billing-page.md) | Org billing page | `03-plans-and-subscriptions` | M | [T-18](03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |
| [T-22](03-plans-and-subscriptions/T-22-admin-subscription-controls.md) | Admin subscription controls | `03-plans-and-subscriptions` | M | [T-17](04-admin-panel/T-17-admin-organization-detail-and-review-dialogs.md), [T-18](03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |
| [T-23](03-plans-and-subscriptions/T-23-admin-plans.md) | Admin plans | `03-plans-and-subscriptions` | L | [T-07](01-admin-access/T-07-admin-shell.md), [T-18](03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |

### Phase 4: Panel polish

| Ticket | Title | Folder | Size | Depends on |
| --- | --- | --- | --- | --- |
| [T-24](04-admin-panel/T-24-admin-dashboard.md) | Admin dashboard | `04-admin-panel` | M | [T-16](04-admin-panel/T-16-admin-organizations-list.md) |
| [T-25](04-admin-panel/T-25-admin-users.md) | Admin users | `04-admin-panel` | M | [T-07](01-admin-access/T-07-admin-shell.md), [T-14](04-admin-panel/T-14-audit-plumbing-for-admin-actions.md) |
| [T-26](04-admin-panel/T-26-admin-audit-log-page.md) | Admin audit log page | `04-admin-panel` | M | [T-14](04-admin-panel/T-14-audit-plumbing-for-admin-actions.md) |
| [T-27](00-cross-cutting/T-27-verification-pass.md) | Verification pass | `00-cross-cutting` | S | everything above |

## Dependency order

```
T-01 ─┬─ T-03 ─┬─ T-04
      │        ├─ T-05 ─┬─ T-06
      │        │        └─ T-07 ─┬─ T-16 ─┬─ T-17 ─── T-22
      │        │                 │        └─ T-24
      │        │                 ├─ T-23
      │        │                 └─ T-25
      │        ├─ T-08 (+T-13)
      │        └─ T-09 ─┬─ T-10 ── T-11
      │                 └─ T-15 (+T-13, T-14) ── T-17
      ├─ T-12
      ├─ T-14 ── T-26
      └─ T-18 ─┬─ T-19
T-02 ─┬─ T-13  ├─ T-20
      └─ T-18  ├─ T-21
               ├─ T-22
               └─ T-23
```

These can run in parallel:
- T-02 alongside T-01
- T-12 and T-13 once T-01 is in
- T-18 through T-21 alongside phase 2's UI tickets
