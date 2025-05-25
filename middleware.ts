export { default } from "next-auth/middleware";

// Optionally, specify which paths should be protected
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files like images, svgs)
     * - auth (authentication routes like a custom sign-in page if you create one)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public|auth).*)",
  ],
}; 