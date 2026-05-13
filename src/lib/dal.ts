"use server";
import { decrypt } from "@/lib/session";
import { AuthUser, } from "@/types/auth-user";
import { cookies } from "next/headers";

export const getAuthUser = async () => {
  try {
    // get cookie
    const cookie = await cookies();

    // get session
    const session = cookie.get("session")?.value;

    // get user data
    const user = await decrypt(session);

    return user as AuthUser;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getDashboardRole = async () => {
  try {
    // get cookie
    const cookie = await cookies();

    // get session
    const session = cookie.get("role")?.value;

    // get user data
    const role = await decrypt(session);

    return role?.role as string;
  } catch (error) {
    console.error(error);
    return null;
  }
};
