# T-19: Enforce plan limits, remove `QR_QUOTA`

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 3: Plans and subscriptions | M | [03](../../specs/03-plans-and-subscriptions.md) | [T-18](../03-plans-and-subscriptions/T-18-features-billing-scaffold-and-entitlements.md) |

- Limits to enforce:
  - `createQrAction` and `restoreQrAction`: live QR count
  - `inviteMemberAction`: members + pending invitations
  - `beforeAcceptInvitation`: members (F3)
  - `createRoleAction`: custom roles
- Delete `QR_QUOTA` and its export. `QrStats` gets its limit from entitlements, showing "Unlimited" when there's no limit.

**Done when**
- [x] With an expired subscription on Free, creating the 26th QR code and restoring a code past the limit are both refused, while existing codes keep redirecting.
- [x] Accepting an invitation is refused when the org is at its member limit.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F3 | **The member limit can be bypassed with old invitations.** The limit is checked when someone is invited, but not when an invitation is accepted. Invitations sent before a downgrade can push the org over its limit. | Medium | `beforeAcceptInvitation` also checks `members < limits.members`. | T-19 |

## Notes

- **Counts are fresh Prisma counts.** Members and pending invitations are counted with `countMembers` (in `services/member.ts`) and the new `countInvitations` (`services/invitation.ts`), both `{ cache: false }`. They aren't taken from `access.organization.members`, because better-auth's `getFullOrganization` caps that list at `membershipLimit` (100).
- **Re-inviting doesn't take a seat.** The invite check leaves out a pending invitation for the same email, because `cancelPendingInvitationsOnReInvite` replaces it.
- **`beforeAcceptInvitation` (F3)** counts members with `prisma.member.count` and refuses when members ≥ `limits.members`. `lib/auth/auth.ts` can't import `@/features/organizations/server`, because that module imports `auth`.
- **Roles page (beyond the ticket's scope).** "x of N custom" and the "New role" button now use `min(plan limit, MAX_CUSTOM_ROLES)`, so the UI matches what the action enforces. `MAX_CUSTOM_ROLES` stays as better-auth's hard cap.
- **The bulk trash cap moved.** `trashQrCodesAction` used `QR_QUOTA` only to cap how many ids one call can take. It now uses `QR_BULK_MAX = 500`.
- **`QrStatsData` gains `plan: { name, qrLimit }`.** It's filled by `getQrStats`. The stats card shows "Unlimited" with no bar when `qrLimit` is null.
- **Verification:** `tsc` passes. Lint and build fail only on the errors that were already there (see T-18's notes). A throwaway `tsx` script resolved an expired Pro subscription to Free (25 QR codes, 2 members, 0 roles) and confirmed the following:
  - Creating the 26th code and restoring at 25 are refused, with the spec messages.
  - An org that's over its limit can't add codes.
  - An invite is refused at 1 member + 1 pending.
  - Accepting is refused at 2 members.
  - Active Pro still allows the 26th code.
  - The redirect path (`app/q`, `recordScan`) doesn't read entitlements, so existing codes keep redirecting.
- **Not exercised end to end against a database.**
