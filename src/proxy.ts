import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const url = request.nextUrl.clone();

  // Redirect legacy /dashboard and /home paths
  if (url.pathname === "/dashboard" || url.pathname === "/home") {
    url.pathname = "/";
    return NextResponse.redirect(url, 308); // 308 = Permanent Redirect (preserves method)
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)",
  ],
};
