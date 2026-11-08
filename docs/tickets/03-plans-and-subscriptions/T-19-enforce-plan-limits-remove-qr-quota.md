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
- [ ] With an expired subscription on Free, creating the 26th QR code and restoring a code past the limit are both refused, while existing codes keep redirecting.
- [ ] Accepting an invitation is refused when the org is at its member limit.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F3 | **The member limit can be bypassed with old invitations.** The limit is checked when someone is invited, but not when an invitation is accepted. Invitations sent before a downgrade can push the org over its limit. | Medium | `beforeAcceptInvitation` also checks `members < limits.members`. | T-19 |
