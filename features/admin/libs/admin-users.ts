"use server";

import type { Prisma } from "@/generated/prisma/client";
import {
  adminUserListSelect,
  buildAdminUserWhere,
  cannotBanReason,
  isBanActive,
  isSuperadmin,
} from "@/features/admin/libs/admin-user-query";
import { adminUsersSearchParamsSchema } from "@/features/admin/schemas/admin-query-schema";
import { requireAdmin } from "@/features/admin/services/admin-session";
import { countUsers, getUsers } from "@/features/admin/services/user";
import type { SearchParams } from "@/types/params";
import { apiResponse } from "@/utils/response";

const newestFirst = [{ createdAt: "desc" }, { id: "desc" }] satisfies Prisma.UserOrderByWithRelationInput[];

/**
 * /admin/users, straight from its URL search params. Read fresh: ban state is security-sensitive, and the row
 * must show a ban or unban straight after the action.
 */
export const getAdminUsers = async (searchParams: SearchParams) => {
  try {
    const query = adminUsersSearchParamsSchema.parse(searchParams);
    const session = await requireAdmin();

    const where = buildAdminUserWhere(query);
    const [count, rows] = await Promise.all([
      countUsers({ where }, { cache: false }),
      getUsers(
        {
          where,
          select: adminUserListSelect,
          orderBy: newestFirst,
          skip: (query.page - 1) * query.size,
          take: query.size,
        },
        { cache: false },
      ),
    ]);

    const now = new Date();
    const items = rows.map(({ _count, role, banned, banReason, banExpires, ...user }) => {
      const banActive = isBanActive({ banned, banExpires }, now);
      return {
        ...user,
        role: isSuperadmin(role) ? ("superadmin" as const) : ("user" as const),
        organizationCount: _count.members,
        ban: banActive ? { reason: banReason, expiresAt: banExpires } : null,
        isSelf: user.id === session.user.id,
        canBan: !banActive && !cannotBanReason(session.user, { id: user.id, role }),
      };
    });

    return apiResponse.single({ data: { items, count, query } });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
