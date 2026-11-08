# 02: Organization approval

## Goal

Every new organization waits for an admin's review. Until it's approved, the organization appears in its owner's list as **pending**, and you can't open it. Once an admin approves it, the owner gets an activation email and can start working.

## Status model

```prisma
enum OrganizationStatus {
  PENDING    // created, waiting for review
  ACTIVE     // approved; normal use
  REJECTED   // review declined; reason shown to owner
  SUSPENDED  // was active; blocked by an admin; QR redirects stop
}

model Organization {
  // … existing fields
  status         OrganizationStatus @default(PENDING)
  statusReason   String?            @db.VarChar(500) // shown to owners for REJECTED / SUSPENDED
  reviewedAt     DateTime?                           // last status change by an admin
  reviewedById   String?                             // admin user id; SetNull if the admin is deleted
  reviewedBy     User?              @relation("OrganizationReviewer", fields: [reviewedById], references: [id], onDelete: SetNull)

  @@index([status, createdAt])
}
```

- Register `status` and `statusReason` as organization `additionalFields` with **`input: false`**, so `create-organization` and `update-organization` can never set them. Only admin actions write these fields, and they do so through Prisma.
- **Migration:** every existing organization becomes `ACTIVE`, with `reviewedAt = NOW()`.

### Status transitions

The **Who** column says who can trigger the change.

| From | To | Who | Reason required | Email to owners |
| --- | --- | --- | --- | --- |
| *(new)* | PENDING | user creating an org | — | — (admins notified, see below) |
| PENDING | ACTIVE | admin, **Approve** | no | **Activation email** |
| PENDING | REJECTED | admin, **Reject** | **yes** | Rejection email, including the reason |
| ACTIVE | SUSPENDED | admin, **Suspend** | **yes** | Suspension email, including the reason |
| SUSPENDED | ACTIVE | admin, **Reactivate** | no | Reactivation email |
| REJECTED | ACTIVE | admin, **Approve** | no | Activation email. This lets an admin reverse a mistaken rejection. |
| PENDING or REJECTED | *(deleted)* | owner, **Withdraw request** | — | — |

Any other transition is refused. Every transition:

- is a conditional update (`where: { id, status: <expected from> }`). If it matches no row, the action returns "This organization was already reviewed" and changes nothing.
- sets `reviewedAt` and `reviewedById` (except withdrawals).
- writes an `AdminAuditLog` entry (spec 04) and an entry in the organization's own `AuditLog`, using the actions `organization.approve`, `organization.reject`, `organization.suspend` and `organization.reactivate`. Owners see these in their audit log after the organization is active.
- sends its email **after** the write. A failed email is logged and never fails the action, matching the existing welcome-email pattern.

**Approving** also creates the organization's subscription in the same transaction (spec 03). The approve dialog asks for a plan, preselected to the default plan, and an optional period end date.

## The user's side

### Creating an organization

- `/organizations/new` gets a note under the form: "New organizations are reviewed by our team before they're activated. We'll email you when yours is ready."
- `beforeCreateOrganization` (in `lib/auth/auth.ts`) keeps its validation and also refuses the request if the user already has **2 organizations in PENDING** status: "You already have organizations waiting for review."
- `createOrganizationAction` redirects to **`/organizations?requested=<slug>`** instead of `/<slug>`.
- If `ADMIN_NOTIFY_EMAILS` (an optional, comma-separated env var) is set, each address gets a "New organization request: {name}" email with a link to `/admin/organizations/<id>`. A failure here never fails the create.
- The slug is reserved while the request is pending or rejected, and freed when the request is withdrawn.

### The organization list (`/organizations` and the signed-in `/sign-in` view)

The list `OrganizationList` renders comes back in this order:

1. Pending invitations (unchanged).
2. Organizations. Each row looks like this, depending on status:

| Status | Row |
| --- | --- |
| ACTIVE | Unchanged: a link to `/<slug>`. |
| PENDING | **Not a link.** Shown muted, with a `Pending approval` badge and the subtext "Submitted {relative date}". `aria-disabled="true"`, not focusable as a link. |
| REJECTED | **Not a link.** Shows a `Not approved` badge, then the reason in a line beneath, and a **Withdraw request** button. |
| SUSPENDED | A link to `/<slug>`, which shows the suspended screen. Shows a `Suspended` badge. |

- With `?requested=<slug>`, a success notice appears above the list: "**{name}** has been submitted for review. We'll email you when it's approved."
- The **Create organization** button stays available. The pending cap is enforced on submit.
- Status must come from a fresh read. If `listOrganizations()` doesn't return the additional fields, read the statuses with Prisma for the listed ids.

### Opening `/<slug>` directly

`OrganizationShell` (in `app/[organizationSlug]/layout.tsx`) checks the organization's status **before** rendering the sidebar or page:

| Viewer | Status | Result |
| --- | --- | --- |
| not a member | any | `notFound()` (unchanged) |
| member | ACTIVE | normal app |
| member | PENDING | Full-page status screen: org name, a "Waiting for approval" heading, "Submitted {date}. We'll email {owner email} when it's approved.", then **Back to organizations** and (for owners) **Withdraw request** |
| member | REJECTED | Status screen: "This organization wasn't approved", the reason, **Back to organizations**, **Withdraw request** (owners) |
| member | SUSPENDED | Status screen: "This organization is suspended", the reason, "Contact support to restore access.", **Back to organizations** |

The status screen uses the auth layout's centered card style, with no app sidebar. Every route under `/<slug>/…`, including settings, shows the same screen.

### Withdrawing a request

`withdrawOrganizationRequestAction(organizationId)`:

1. Requires a session, and the caller must be an **owner** of the organization.
2. Allowed only while the status is PENDING or REJECTED. Otherwise it returns "Only pending or rejected requests can be withdrawn".
3. Deletes the organization, which cascades to its members.
4. Calls `refresh()`.

This action exists because the normal delete path goes through `requirePermission`, which refuses organizations that aren't active.

## Enforcement (server side)

The UI hides things, but each of these checks applies on the server whatever the UI shows.

1. **`requireMembership` / `requirePermission`** (`features/organizations/services/get-membership.ts`) throw `APIError("FORBIDDEN", { message: "This organization isn't active" })` unless `organization.status === "ACTIVE"`. Every existing loader and action already goes through them, so all QR, tag, report, member, role and settings operations are covered.
   - `getMembership` / `getAccess` still return the membership, with `organization.status` available, so the layout can choose the status screen.
   - `hasPermission` returns false for organizations that aren't active, because the error it catches is an `APIError`.
2. **Status reads are never cached.** The organization is read through `getFullOrganization` per request today. If that changes, status must stay `{ cache: false }`.
3. **better-auth endpoints the client can call directly:**
   - `beforeCreateInvitation`: refuse if the organization isn't active. This is defense in depth, since invite is already server-action-only.
   - `beforeAcceptInvitation`: refuse with "This organization isn't accepting new members right now" if it isn't active.
   - `organization/set-active` is harmless and stays allowed.
4. **QR redirects** (`app/q/[slug]/page.tsx`): select `organization: { select: { status: true } }`. If the status is `SUSPENDED`, render `InactiveQr` with "This QR code is unavailable". PENDING and REJECTED organizations can't have QR codes, but any status other than ACTIVE is treated the same way.

## Emails

New templates go in `features/email/templates/` and use `emailLayout` and `escapeHtml`. Each is exported from `features/email/server.ts`.

| Template | To | Subject | Body / button |
| --- | --- | --- | --- |
| `organizationRequestEmail` | `ADMIN_NOTIFY_EMAILS` | New organization request: {name} | Requester name and email, org name and slug. Button: **Review request** → `/admin/organizations/<id>` |
| `organizationApprovedEmail` (the activation email) | all owners | {name} is ready to use | "Your organization **{name}** has been approved." Plan name. Button: **Open {name}** → `/<slug>` |
| `organizationRejectedEmail` | all owners | Your request for {name} wasn't approved | The reason, and how to contact support. Button: **View request** → `/organizations` |
| `organizationSuspendedEmail` | all owners | {name} has been suspended | The reason. "Your QR codes have stopped redirecting." Support contact |
| `organizationReactivatedEmail` | all owners | {name} is active again | Button: **Open {name}** → `/<slug>` |

## Admin side (summary; full UI in spec 04)

The actions live in `features/admin/actions/review-organization.ts`. Each one calls `requireAdmin()` first.

```ts
approveOrganizationAction(id, { planId, currentPeriodEnd?, status?: "ACTIVE" | "TRIALING" })
rejectOrganizationAction(id, { reason })        // reason: 3–500 chars
suspendOrganizationAction(id, { reason })       // reason: 3–500 chars
reactivateOrganizationAction(id)
```

## Acceptance criteria

- [ ] A new organization is stored as PENDING, even if the client calls `/api/auth/organization/create` directly with `status: "ACTIVE"`.
- [ ] After creating, the user lands on `/organizations?requested=…`, sees the notice, and sees the org with a "Pending approval" badge and no link.
- [ ] Opening `/<pending-slug>` or `/<pending-slug>/settings/members` shows the waiting screen. Calling any QR or settings action for it returns "This organization isn't active".
- [ ] A user can't have more than 2 pending organizations.
- [ ] Approving sends the activation email to every owner. The org becomes a link in their list, and the app opens normally.
- [ ] Rejecting requires a reason, which appears in the list, on the status screen and in the email. The owner can withdraw the request, which frees the slug.
- [ ] Suspending stops `/q/<slug>` redirects for all of that organization's codes. Reactivating restores them.
- [ ] Two admins approving the same request at the same time: one succeeds, and the other gets "already reviewed". Only one email and one subscription are created.
- [ ] Organizations that existed before the migration are ACTIVE, and nothing changes for their members.
- [ ] A failing SMTP server doesn't fail approve, reject, suspend, reactivate or create.
