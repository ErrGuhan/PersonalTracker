import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();

  // 1. Ensure root landing for legacy /dashboard and /home paths
  if (url.pathname === "/dashboard" || url.pathname === "/home") {
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  // 2. Immediate non-blocking response for instant page rendering
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
