import { createAccessControl } from "better-auth/plugins/access";
import { defaultStatements } from "better-auth/plugins/admin/access";

/**
 * Platform access control for better-auth's admin plugin, separate from the organization `ac` in
 * `permissions.ts`. Only `superadmin` has admin power; the plugin's built-in `admin` role is not
 * registered, so "admin" stays an organization-only role name and `member.role = "admin"` grants
 * nothing here. Impersonation is out of scope and never granted.
 */
export const adminAc = createAccessControl(defaultStatements);

export const adminRoles = {
  user: adminAc.newRole({ user: [], session: [] }),
  superadmin: adminAc.newRole({
    user: defaultStatements.user.filter((action) => !action.startsWith("impersonate")),
    session: [...defaultStatements.session],
  }),
};

export const SUPERADMIN_ROLE = "superadmin";
