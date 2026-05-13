"use server";

import { apiResponse } from "@/lib/response";
import db from "../../../db/db";
import { baseQuerySchema, BaseQuerySchemaType } from "@/schemas/query";
import { Prisma } from "@prisma/client";

export const getTags = async (query: BaseQuerySchemaType) => {
  try {
    const validatedQuery = baseQuerySchema.parse(query);

    const filter: Prisma.tagsWhereInput = {
      ...(validatedQuery.search && {
        name: {
          contains: validatedQuery.search,
        },
      }),
    };

    const [data, count] = await Promise.all([
      db.tags.findMany({
        where: filter,
        take: validatedQuery.size,
        skip: (validatedQuery.page - 1) * validatedQuery.size,
      }),
      db.tags.count(),
    ]);

    return apiResponse.multi({
      data,
      count,
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};
