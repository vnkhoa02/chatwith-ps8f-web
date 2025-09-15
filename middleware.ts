import { AUTH_CONFIG } from "@/config/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const PROTECTED_PATHS = ["/app", "/chat", "/dashboard"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  const shouldProtect = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(p + "/"),
  );
  if (!shouldProtect) return NextResponse.next();

  const cookie = req.cookies.get(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN)?.value;

  if (!cookie) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/app/:path*", "/chat/:path*", "/dashboard/:path*"],
};
