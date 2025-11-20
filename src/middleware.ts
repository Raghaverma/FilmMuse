import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/account", "/profile"];
const PUBLIC_AUTH_PATHS = new Set(["/login", "/signup"]);

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  // Check for Firebase auth cookie (set by auth-context) or legacy auth cookie
  const isAuthed = req.cookies.get("firebase-auth")?.value === "1" || 
                   req.cookies.get("auth")?.value === "1";

  // Redirect /home to root
  if (pathname === "/home" || pathname.startsWith("/home/")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

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



