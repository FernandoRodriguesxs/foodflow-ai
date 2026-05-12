import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME } from "@/lib/api-config";

const PROTECTED_PREFIX = "/dashboard";
const AUTH_ROUTES = ["/login", "/register"];

export function proxy(request: NextRequest): NextResponse {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const { pathname } = request.nextUrl;
  if (isProtected(pathname) && !token) {
    return redirectTo(request, "/login");
  }
  if (isAuthRoute(pathname) && token) {
    return redirectTo(request, "/dashboard");
  }
  return NextResponse.next();
}

function isProtected(pathname: string): boolean {
  return pathname === PROTECTED_PREFIX || pathname.startsWith(`${PROTECTED_PREFIX}/`);
}

function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function redirectTo(request: NextRequest, path: string): NextResponse {
  const url = request.nextUrl.clone();
  url.pathname = path;
  url.search = "";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
