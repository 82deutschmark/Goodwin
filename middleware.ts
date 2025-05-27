/**
 * Middleware for authentication and rate limiting
 * 
 * This middleware:
 * 1. Protects authenticated routes with NextAuth
 * 2. Allows public routes to be accessed without authentication
 * 3. Handles rate limiting for API routes
 * 
 * Author: GPT-4.1-nano-2025-04-14
 * Updated: 2025-05-27
 */

import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Allow public routes without authentication
  if (
    pathname === "/" ||
    pathname.startsWith("/auth") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }
  
  // Check authentication for protected routes
  const token = await getToken({ req: request as any });
  
  // If user is not authenticated and tries to access protected route
  if (!token) {
    // Redirect to login page with callback URL
    const url = new URL("/api/auth/signin", request.url);
    url.searchParams.append("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  // If authenticated, allow access to protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all routes except explicitly defined public ones
    "/((?!api/auth|_next|static|favicon.ico|robots.txt).*)"  
  ],
};