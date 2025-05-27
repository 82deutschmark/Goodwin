export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // Only protect these specific paths
    "/dashboard",
    "/account",
    "/settings"
  ],
};