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

    // Allow local dev access when Supabase is not yet configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const isDevNoSupabase =
      process.env.NODE_ENV !== "production" &&
      (!supabaseUrl || supabaseUrl.includes("your-project") || !supabaseUrl.startsWith("http"));

    if (isDevNoSupabase) {
      return res;
    }

    // Check for built-in admin session or Supabase session cookies.
    const allCookies = req.cookies.getAll();
    const hasAdminSession = allCookies.some((c) => c.name === "px_admin_session");
    const hasSupabaseAuthCookie = allCookies.some(
      (c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token")
    );

    if (!hasAdminSession && !hasSupabaseAuthCookie) {
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
