"use server";

import { apiResponse } from "@/lib/response";
import { Prisma } from "@prisma/client";
import db from "../../../db/db";
import { qrQuerySchema, QrQuerySchemaType } from "@/schemas/qr";
import { QrTableProps } from "@/app/admin/page";

export const getQRlist = async (query: QrQuerySchemaType) => {
  try {
    const { page, size, search, isTrash, tag } = qrQuerySchema.parse(query);

    const filter: Prisma.QrLinksWhereInput = {
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            admin: {
              name: { contains: search },
            },
          },
        ],
      }),
      ...(isTrash && {
        isTrashed: isTrash === "yes",
      }),
      ...(tag && {
        qr_tag: {
          some: {
            tags: {
              slug: tag,
            },
          },
        },
      }),
    };

    const [data, count] = await Promise.all([
      db.qrLinks.findMany({
        where: filter,
        take: size,
        skip: (page - 1) * size,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          admin: true,
          qr_tag: {
            select: {
              tags: {
                select: {
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      }),
      db.qrLinks.count({
        where: filter,
      }),
    ]);

    return apiResponse.multi({
      data: data as QrTableProps[],
      count,
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
