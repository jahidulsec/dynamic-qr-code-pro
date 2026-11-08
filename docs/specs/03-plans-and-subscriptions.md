# 03: Plans and subscriptions

## Goal

Admins maintain a catalogue of plans and control each organization's subscription. A plan's limits replace the hard-coded `QR_QUOTA` and are enforced on the server. Billing is manual in v1: no payment provider is involved.

## Data model

```prisma
model Plan {
  id             String    @id @default(cuid())
  key            String    @unique @db.VarChar(32)  // "free", "pro"; stable, lowercase, never renamed
  name           String    @db.VarChar(64)
  description    String?   @db.VarChar(255)
  priceMonthly   Int       @default(0)              // minor units (cents); display only in v1
  priceYearly    Int       @default(0)
  currency       String    @default("USD") @db.Char(3)
  // null = unlimited
  maxQrCodes     Int?
  maxMembers     Int?
  maxCustomRoles Int?
  // feature flags, e.g. {"reports":true,"auditLog":false,"csvExport":true}
  features       Json
  isDefault      Boolean   @default(false)          // exactly one plan; applies when no subscription is in effect
  isPublic       Boolean   @default(true)           // for a future pricing page
  sortOrder      Int       @default(0)
  archivedAt     DateTime?                          // archived plans can't be newly assigned
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  subscriptions  Subscription[]

  @@map("plan")
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  CANCELED
}

enum BillingInterval {
  MONTH
  YEAR
  NONE      // free / lifetime / custom deal
}

model Subscription {
  id                 String             @id @default(cuid())
  organizationId     String             @unique
  organization       Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)
  planId             String
  plan               Plan               @relation(fields: [planId], references: [id], onDelete: Restrict)
  status             SubscriptionStatus
  interval           BillingInterval    @default(NONE)
  currentPeriodStart DateTime
  currentPeriodEnd   DateTime?          // null = no end date
  canceledAt         DateTime?
  provider           String             @default("manual") @db.VarChar(32) // later: "stripe"
  externalId         String?            @unique @db.VarChar(255)
  notes              String?            @db.Text                          // admin-only, never shown to users
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([planId])
  @@index([currentPeriodEnd])
  @@map("subscription")
}
```

- An organization has **at most one** subscription row. Changes update that row, and the history of changes lives in the admin audit log (spec 04).
- `onDelete: Restrict` on `planId` means a plan that's in use can't be deleted, only archived.
- **Exactly one default plan.** Setting `isDefault` on a plan clears it from every other plan in the same transaction. The default plan can't be archived.

### Feature flags

The keys are a fixed, typed list in `features/billing/constants.ts`. Unknown keys are dropped when a plan is saved, the same way `normalizePermissions` does for roles.

| Key | What it gates |
| --- | --- |
| `reports` | The `/<slug>/reports` page and the QR analytics dialog |
| `auditLog` | The `/<slug>/settings/audit-log` page |
| `csvExport` | CSV export of the QR list. Image downloads are always allowed. |

### Seed data (in the migration)

| key | name | QR codes | Members | Custom roles | reports | auditLog | csvExport | default |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `free` | Free | 25 | 2 | 0 | yes | no | no | **yes** |
| `pro` | Pro | 500 | 10 | 5 | yes | yes | yes | |
| `business` | Business | unlimited | unlimited | 20 | yes | yes | yes | |

The limits and prices are placeholders, and admins can edit them after launch.

**Existing organizations:** each one gets a `pro` subscription with `status = ACTIVE`, `interval = NONE` and `currentPeriodEnd = null`. This matches today's 500-code quota, so nobody loses capacity. *(Open question in the README.)*

## Effective plan

`features/billing/server.ts` exports:

```ts
getEntitlements(organizationId): Promise<Entitlements>  // fresh read ({ cache: false }), shared per request via React cache()

type Entitlements = {
  plan: { id; key; name };
  state: "trialing" | "active" | "expired" | "canceled" | "none";  // derived, see below
  currentPeriodEnd: Date | null;
  limits: { qrCodes: number | null; members: number | null; customRoles: number | null };
  features: { reports: boolean; auditLog: boolean; csvExport: boolean };
};
```

`state` comes from the subscription row:

| Subscription | `state` | Plan used |
| --- | --- | --- |
| none | `none` | default plan |
| TRIALING or ACTIVE, `currentPeriodEnd` null or in the future | `trialing` / `active` | subscription's plan |
| TRIALING or ACTIVE, `currentPeriodEnd` in the past | `expired` | **default plan** |
| CANCELED | `canceled` | **default plan** |

No scheduled job is needed. Because expiry is worked out at read time, it takes effect the moment `currentPeriodEnd` passes.

## Enforcement

All limit checks run on the server, inside the existing actions, **after** `requirePermission` and with fresh counts.

| Where | Check | Message when refused |
| --- | --- | --- |
| `createQrAction` (`features/qr/actions/save-qr.ts`) | live (not trashed) QR count < `limits.qrCodes`. Replaces `QR_QUOTA` | "You've reached your plan's limit of {n} QR codes. Empty the trash or upgrade to add more." |
| Restoring from trash | the same check as creating | "Restoring would exceed your plan's limit of {n} QR codes." |
| Inviting a member (`manage-members.ts`) | members + pending, unexpired invitations < `limits.members` | "Your plan allows {n} members, including pending invitations." |
| Creating a role (`manage-roles.ts`) | custom role count < `limits.customRoles` | "Your plan allows {n} custom roles." / "Custom roles aren't included in your plan." when the limit is 0 |
| Reports page, analytics loader | `features.reports` | The page shows an upgrade notice instead of data, and the loader returns FORBIDDEN. |
| Audit log page and loader | `features.auditLog` | as above |
| CSV export action | `features.csvExport` | "CSV export isn't included in your plan." |

**Over the limit after a downgrade or expiry:** nothing is deleted or paused. Existing QR codes, members and roles stay and keep working. Only *adding* more is blocked until usage drops below the limit or the plan changes.

- `MAX_CUSTOM_ROLES` in `lib/auth/auth.ts` stays as the hard upper bound (20) on what better-auth allows. Plan limits are enforced in our actions below it.
- `QR_QUOTA` is removed. `QrStats` and any other UI read the limit from entitlements (`null` shows as "Unlimited").

## The organization's billing page: `/<slug>/settings/billing`

- A new **Billing** tab in `SettingsNav`. It's visible to every member and is read-only.
- It shows:
  - the plan name, and the state badge (Active, Trial, Expired, Canceled)
  - "Renews / ends on {date}", or "No end date"
  - **usage bars:** QR codes {used}/{limit}, members {used}/{limit}, custom roles {used}/{limit}, with unlimited shown as text
  - included features, with a check or cross for each
- When the plan is expired or canceled, a notice reads: "Your {plan} plan ended on {date}. You're on {default plan} limits." Extending the plan is done by the admin.
- Call to action: "Need more? Contact us to change your plan" (a `mailto:` support address from `siteConfig`). There's no self-serve checkout in v1.

## Admin controls (UI in spec 04)

The actions live in `features/admin/actions/manage-subscription.ts` and `manage-plans.ts`. Each one calls `requireAdmin()` and writes an admin audit entry with the before and after values in `metadata`.

```ts
// subscription: one per organization
setSubscriptionAction(organizationId, {
  planId, status: "TRIALING" | "ACTIVE", interval, currentPeriodStart, currentPeriodEnd: Date | null, notes?,
})                                                       // creates or replaces the row
extendSubscriptionAction(organizationId, { by: "month" | "year" } | { until: Date })
                                                         // from max(now, currentPeriodEnd); reactivates an expired one
cancelSubscriptionAction(organizationId, { reason? })    // status CANCELED, canceledAt now; default plan applies immediately

// plans
createPlanAction(input) / updatePlanAction(id, input)
setDefaultPlanAction(id)
archivePlanAction(id) / unarchivePlanAction(id)          // the default plan can't be archived
```

**Rules:**

- An archived plan can't be chosen in `setSubscriptionAction` or in the approve dialog. Organizations already on it stay on it.
- `currentPeriodEnd` must be after `currentPeriodStart`.
- Changing an organization's plan sends the owners a `subscriptionChangedEmail`: "Your plan is now {plan}", with the end date and a link to the billing page. Expiring or extending a plan sends no email in v1.
- Editing a plan's limits applies at once to every organization on that plan. The plan form warns: "{n} organizations are on this plan."
- Plan keys must match `^[a-z][a-z0-9-]{1,31}$` and can't be changed after creation.

## Module layout

```
features/billing/
  index.ts                 client-safe: schemas, constants, BillingOverview component, types
  server.ts                getEntitlements, requireEntitlement, assertWithinLimit
  constants.ts             PLAN_FEATURES, labels
  schemas/plan-schema.ts   planFormSchema, subscriptionFormSchema
  services/plan.ts         cached Prisma wrappers (cacheTags.plans)
  services/subscription.ts cached Prisma wrappers (cacheTags.subscriptions)
  libs/entitlements.ts     effective-plan resolution (pure function + loader)
  components/billing-overview.tsx, usage-bar.tsx
```

- Admin actions live in `features/admin` and use billing's `server.ts`.
- `features/qr` and `features/organizations` import `requireEntitlement` / `assertWithinLimit` from `@/features/billing/server`.
- Add the new cache tags `plans`, `planCount`, `subscriptions` and `subscriptionCount` to `lib/cache/cache-tags.ts`.

## Acceptance criteria

- [ ] Once migrated, every existing organization has a Pro subscription with no end date and can still create up to 500 QR codes.
- [ ] Approving an organization creates its subscription with the plan chosen in the approve dialog.
- [ ] With the subscription's `currentPeriodEnd` set to yesterday, the org uses Free limits: creating a 26th QR code is refused, existing codes keep redirecting, and the billing page shows "Expired".
- [ ] `extendSubscriptionAction({ by: "month" })` on an expired subscription restores its plan straight away.
- [ ] Inviting a member is refused when members + pending invitations reach the limit.
- [ ] The reports page and the analytics loader are both refused on a plan without `reports`, including when called directly.
- [ ] There is always exactly one default plan, and it can't be archived. A plan in use can't be deleted.
- [ ] `QR_QUOTA` no longer exists, and the QR stats card shows the plan's limit or "Unlimited".
