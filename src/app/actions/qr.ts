"use server";

import { getUser } from "@/lib/dal";
import db from "../../../db/db";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";

const qrSchema = z.object({
  name: z.string().min(1),
  link: z.string().min(1),
});

export const addQr = async (prevData: unknown, formData: FormData) => {
  const result = qrSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return {
      error: result.error.formErrors.fieldErrors,
      success: null,
      db: null,
    };
  }

  const data = result.data;

  try {
    const user = await getUser();

    if (!user) {
      return {
        error: null,
        success: null,
        toast: "Invalid user, please login again",
      };
    }

    await db.qrLinks.create({
      data: {
        ...data,
        adminId: user.id,
      },
    });

    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: null,
        success: null,
        toast: error.message.split("\n").pop(),
      };
    }
  }

  return { error: null, success: "Doctor has been added", toast: null };
};

export const updateQr = async (
  id: string,
  prevData: unknown,
  formData: FormData,
) => {
  const result = qrSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return {
      error: result.error.formErrors.fieldErrors,
      success: null,
      db: null,
    };
  }

  const data = result.data;

  try {
    const user = await getUser();

    if (!user) {
      return {
        error: null,
        success: null,
        toast: "Invalid user, please login again",
      };
    }

    await db.qrLinks.update({
      where: { id },
      data: {
        ...data,
        adminId: user.id,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/admin");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: null,
        success: null,
        toast: error.message.split("\n").pop(),
      };
    }
  }

  return { error: null, success: "Doctor has been added", toast: null };
};

export const moveQrTrash = async (id: string) => {
  const qr = await db.qrLinks.findUnique({
    where: { id: id },
  });

  if (!qr) {
    throw new Error("No data found to take action");
  }
  await db.qrLinks.update({
    where: {
      id: id,
    },
    data: {
      isTrashed: true,
    },
  });
  revalidatePath("/");
  revalidatePath("/qr/" + id);
  return;
};
