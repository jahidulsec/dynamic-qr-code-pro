"use server";

import db from "../../../db/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { QrSchemaType } from "@/schemas/qr";
import { getAuthUser } from "@/lib/dal";
import { apiResponse } from "@/lib/response";

export const addQr = async (data: QrSchemaType) => {
  try {
    const { tags, ...rest } = data;
    const res = await db.qrLinks.create({
      data: {
        ...rest,
      },
    });

    revalidatePath("/admin");

    return apiResponse.single({
      message: "Create qr links successful",
      data: res,
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const updateQr = async (id: string, data: QrSchemaType) => {
  try {
    const { tags, ...rest } = data;
    const res = await db.qrLinks.update({
      where: { id },
      data: {
        ...rest,
      },
    });

    revalidatePath("/admin");

    return apiResponse.single({
      message: "Create qr links successful",
      data: res,
    });
  } catch (error) {
    return apiResponse.error({ error });
  }
};

export const moveQrTrash = async (id: string) => {
  const qr = await db.qrLinks.findUnique({
    where: { id: id },
  });

  if (!qr) {
    return {
      error: null,
      success: null,
      toast: "No data found for this action",
    };
  }
  await db.qrLinks.update({
    where: {
      id: id,
    },
    data: {
      isTrashed: true,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/qr/" + id);

  return {
    error: null,
    success: "Data is moved to trash",
    toast: null,
  };
};

export const restoreQrTrash = async (id: string) => {
  const qr = await db.qrLinks.findUnique({
    where: { id: id },
  });

  if (!qr) {
    return {
      error: null,
      success: null,
      toast: "No data found for this action",
    };
  }
  await db.qrLinks.update({
    where: {
      id: id,
    },
    data: {
      isTrashed: false,
    },
  });
  revalidatePath("/admin");
  revalidatePath("/qr/" + id);
  return {
    error: null,
    success: "Data is restored",
    toast: null,
  };
};

export const deleteQr = async (id: string) => {
  try {
    const qr = await db.qrLinks.findUnique({
      where: { id: id },
    });

    if (!qr) {
      return {
        error: null,
        success: null,
        toast: "No data found for this action",
      };
    }
    await db.qrLinks.delete({
      where: {
        id: id,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin/trash");

    return {
      error: null,
      success: "Deleted successfully",
      toast: null,
    };
  } catch (error: any) {
    return {
      error: error,
      success: null,
      toast: null,
    };
  }
};
