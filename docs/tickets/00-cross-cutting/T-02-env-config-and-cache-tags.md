# T-02: Env, config and cache tags

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 1: Foundation | S | [02](../../specs/02-organization-approval.md), [03](../../specs/03-plans-and-subscriptions.md), [04](../../specs/04-admin-panel.md) | none |

- `lib/env.ts` and `.env.example`:
  - `ADMIN_NOTIFY_EMAILS`: optional, comma-separated, each address validated
  - `SUPPORT_EMAIL`: required email (F8)
- Add `siteConfig.supportEmail`.
- Add these keys to `lib/cache/cache-tags.ts`: `plans`, `planCount`, `subscriptions`, `subscriptionCount`, `adminAuditLogs` and `adminAuditLogCount`.

**Done when**
- [ ] The app boots with the new variables, and a malformed `ADMIN_NOTIFY_EMAILS` fails env validation.

## Related findings

| # | Finding | Severity | Resolution | Ticket |
| --- | --- | --- | --- | --- |
| F8 | **There's no support contact anywhere.** Emails and the billing page say "contact support", but `siteConfig` has no support address. | Low | Add a `SUPPORT_EMAIL` env var, exposed through `siteConfig.supportEmail`. | T-02 |
