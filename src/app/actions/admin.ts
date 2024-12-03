"use server";

import { getUser } from "@/lib/dal";
import { z } from "zod";
import db from "../../../db/db";
import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { deleteSession } from "@/lib/session";

const addSchema = z.object({
  username: z.string().min(3),
  name: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["superadmin", "admin"]),
});

export const addAdmin = async (prevData: unknown, formData: FormData) => {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));

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

    if (user.role != "superadmin") {
      return {
        error: null,
        success: null,
        toast: "You don't have permission for this actions",
      };
    }

    await db.admin.create({
      data: {
        ...data,
      },
    });

    revalidatePath("/admin/settings");
    revalidatePath("/admin");

    return { error: null, success: "New admin is added", toast: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: null,
        success: null,
        toast: error.message.split("\n").pop(),
      };
    }
  }
};

export const updateAdmin = async (
  id: string,
  prevData: unknown,
  formData: FormData
) => {
  const result = addSchema.safeParse(Object.fromEntries(formData.entries()));

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

    if (user.role != "superadmin") {
      return {
        error: null,
        success: null,
        toast: "You don't have permission for this actions",
      };
    }

    const admin = await db.admin.findUnique({
      where: { id },
    });

    if (!admin) {
      return {
        error: null,
        success: null,
        toast: "No admin found",
      };
    }

    await db.admin.update({
      where: { id },
      data: {
        ...data,
      },
    });

    if (admin.id == user.id) {
      await deleteSession();
    }

    revalidatePath("/admin/settings");
    return { error: null, success: "New admin is added", toast: null };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return {
        error: null,
        success: null,
        toast: error.message.split("\n").pop(),
      };
    }
  }
};

export const deleteAdmin = async (id: string) => {
  try {
    const user = await getUser();

    if (!user) {
      return {
        error: null,
        success: null,
        toast: "Invalid user, please login again",
      };
    }

    if (user.role != "superadmin") {
      return {
        success: null,
        toast: "You don't have permission for this actions",
      };
    }

    const admin = await db.admin.findUnique({
      where: { id: id },
    });

    if (!admin) {
      throw new Error("No data found to take action");
    }

    await db.admin.delete({
      where: {
        id: id,
      },
    });

    if (admin.id == user.id) {
      await deleteSession();
    }

    revalidatePath("/admin");
    revalidatePath("/admin/trash");

    return {
      error: null,
      success: "Deleted Successfully",
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
