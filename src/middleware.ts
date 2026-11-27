import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Guard /admin routes
  if (pathname.startsWith("/admin")) {
    const res = NextResponse.next();

    // Enforce noindex on all admin pages
    res.headers.set("X-Robots-Tag", "noindex, nofollow");

    // Allow login page without auth cookie check
    if (pathname === "/admin/login") {
      return res;
    }

    // Check for Supabase session cookies (sb-*-auth-token)
    const allCookies = req.cookies.getAll();
    const hasAuthCookie = allCookies.some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    if (!hasAuthCookie) {
      const loginUrl = new URL("/admin/login", req.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
