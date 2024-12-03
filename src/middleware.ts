import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/session";
import { cookies } from "next/headers";

const protectedRoutes = ["/admin/settings"];

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path);

  // Decrypt the session from the cookie
  const cookie = (await cookies()).get("session")?.value;
  const session = await decrypt(cookie);

  // Redirect to /login if the user is not authenticated
  if (!session?.userId) {
    return NextResponse.redirect(new URL("/login", req.nextUrl), {
      status: 307,
    });
  }

  // Redirect to /admin if the user is authenticated
  if (session?.userId && !req.nextUrl.pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }


  const userRole = session.role;

  if (isProtectedRoute && userRole == "admin") {
    return NextResponse.redirect(new URL("/admin", req.nextUrl));
  }

  return NextResponse.next();
}

// Routes Middleware should not run on
export const config = {
  matcher: ["/admin/:path*"],
};
