"use server";

import { createSession, deleteSession } from "@/lib/session";
import db from "../../../db/db";
import { z } from "zod";

const authSchema = z.object({
  username: z.string().min(1, { message: "Enter admin username" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters" }),
});

export const adminLogin = async (prevData: unknown, formData: FormData) => {
  const result = authSchema.safeParse(Object.fromEntries(formData.entries()));

  if (result.success === false) {
    return {
      error: result.error.formErrors.fieldErrors,
      success: null,
      db: null,
    };
  }

  const data = result.data;

  const user = await db.admin.findFirst({ where: { username: data.username } });

  if (user == null) {
    return { error: null, success: null, db: "Invalid username" };
  }

  if (user.password !== data.password) {
    return { error: null, success: null, db: "Invalid password" };
  }

  const userId = user.id;

  await createSession(userId);

  return { error: null, success: true, db: null };
};

export async function logout() {
  await deleteSession();
}
