/**
 * NextAuth Route Handler
 *
 * This file handles NextAuth API routes in the App Router.
 * Auth configuration has been moved to /app/api/auth/options.ts to avoid Next.js route export restrictions.
 *
 * Author: GPT-4.1-nano-2025-04-14
 * Last updated: 2025-05-27
 */

import NextAuth from "next-auth";
import { authOptions } from "../options";
// For debugging OAuthCallback errors, temporarily use:
// import { authOptionsSimple as authOptions } from "../options-simple";

// Create the handler with the auth options imported from options.ts
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests - this is required for Next.js App Router
export { handler as GET, handler as POST };