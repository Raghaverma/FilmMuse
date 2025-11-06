import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/home", "/account", "/profile"];
const PUBLIC_AUTH_PATHS = new Set(["/login", "/signup"]);

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const isAuthed = req.cookies.get("auth")?.value === "1";

  // Allow root path for everyone - it shows home page content with conditional auth UI
  if (pathname === "/") {
    return NextResponse.next();
  }

  if (PROTECTED_PREFIXES.some((p) => pathname.startsWith(p)) && !isAuthed) {
    const nextParam = encodeURIComponent(pathname + (search || ""));
    return NextResponse.redirect(new URL(`/?next=${nextParam}`, req.url));
  }

  if (PUBLIC_AUTH_PATHS.has(pathname) && isAuthed) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/home/:path*", "/account/:path*", "/profile/:path*", "/login", "/signup"],
};



