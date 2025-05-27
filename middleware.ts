export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // Only protect these specific paths
    "/chat",
    "/dashboard",
    "/account",
    "/settings"
  ],
};