# T-12: Stop QR redirects for suspended orgs

| Phase | Size | Specs | Depends on |
| --- | --- | --- | --- |
| Phase 2: Organization approval | S | [02](../../specs/02-organization-approval.md) | [T-01](../00-cross-cutting/T-01-schema-migration-for-status-plans-subscriptions-admin-audit.md) |

- `app/q/[slug]/page.tsx`: select `organization.status`. Any status other than ACTIVE renders `InactiveQr` with "This QR code is unavailable", and no scan is recorded.

**Done when**
- [ ] Suspending stops the org's codes from redirecting, and reactivating starts them again.
