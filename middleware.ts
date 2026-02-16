import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static assets and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Define paths that should be considered public (accessible without authentication)
  const publicPaths = [
    "/login",
    "/welcome",
  ];

  // Check if the current path is a public path
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Get the token from NextAuth
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Treat missing or invalid/expired tokens as unauthenticated
  const isTokenInvalid =
    !token ||
    token.error === "RefreshAccessTokenError" ||
    !token.accessToken;

  // If the user is trying to access a protected route without a valid token, redirect to login
  if (!isPublicPath && isTokenInvalid) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If the user has a valid token and is trying to access a public path, redirect to home
  if (isPublicPath && !isTokenInvalid) {
    const homeUrl = new URL("/", request.url);
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};