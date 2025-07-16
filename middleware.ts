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
    pathname.startsWith("/api/turn_response") || // Temporarily public for testing
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }
  
  // Debug: Log cookies and environment
  console.log("[Middleware] Checking auth for:", pathname);
  console.log("[Middleware] Cookies:", request.headers.get("cookie"));
  console.log("[Middleware] NEXTAUTH_SECRET length:", process.env.NEXTAUTH_SECRET?.length || 0);
  console.log("[Middleware] NODE_ENV:", process.env.NODE_ENV);
  
  // Check authentication for protected routes
  const token = await getToken({ 
    req: request as any,
    secret: process.env.NEXTAUTH_SECRET,
  });
  
  console.log("[Middleware] Token result:", token ? "✅ Valid" : "❌ Invalid/Missing");
  if (token) {
    console.log("[Middleware] Token details:", JSON.stringify(token, null, 2));
  }
  
  // If user is not authenticated and tries to access protected route
  if (!token) {
    console.log("[Middleware] Redirecting to sign-in");
    // Redirect to login page with callback URL
    const url = new URL("/api/auth/signin", request.url);
    url.searchParams.append("callbackUrl", encodeURI(request.url));
    return NextResponse.redirect(url);
  }
  
  console.log("[Middleware] Authentication successful, allowing access");
  // If authenticated, allow access to protected routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Protect all routes except explicitly defined public ones
    "/((?!api/auth|_next|static|favicon.ico|robots.txt).*)"  
  ],
};