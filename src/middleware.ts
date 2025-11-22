import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PROTECTED_PREFIXES = ["/account", "/profile"];
const PUBLIC_AUTH_PATHS = new Set(["/login", "/signup"]);

// Verify Firebase ID token from Authorization header or cookie
async function verifyFirebaseToken(request: NextRequest): Promise<boolean> {
  // Check for Firebase ID token in Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    // Token is present, let Firebase Admin SDK verify it on API routes
    // For middleware, we'll check if user has valid session cookie
    return true;
  }

  // Check for Firebase auth cookie (set by auth-context)
  const firebaseAuthCookie = request.cookies.get("firebase-auth")?.value;
  if (firebaseAuthCookie === "1") {
    return true;
  }

  // Legacy auth cookie support
  const legacyAuthCookie = request.cookies.get("auth")?.value;
  if (legacyAuthCookie === "1") {
    return true;
  }

  return false;
}

export async function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Redirect /home to root
  if (pathname === "/home" || pathname.startsWith("/home/")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Allow root path for everyone - it shows home page content with conditional auth UI
  if (pathname === "/") {
    return NextResponse.next();
  }

  // Check authentication for protected routes
  const isAuthed = await verifyFirebaseToken(req);

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
  matcher: [
    "/",
    "/home/:path*",
    "/account/:path*",
    "/profile/:path*",
    "/login",
    "/signup"
  ],
};
