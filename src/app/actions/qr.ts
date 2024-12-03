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

  return { error: null, success: "QR is added", toast: null };
};

export const updateQr = async (
  id: string,
  prevData: unknown,
  formData: FormData
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

  return { error: null, success: "QR is updated", toast: null };
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
      success: null,
      toast: "No data found for this action",
    };
  } catch (error: any) {
    return {
      error: error,
      success: null,
      toast: null,
    };
  }
};
