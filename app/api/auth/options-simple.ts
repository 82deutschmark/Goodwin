/**
 * Simplified NextAuth Configuration for Debugging
 *
 * This is a minimal version to help debug OAuthCallback errors.
 * Use this temporarily by importing it in route.ts instead of options.ts
 *
 * Author: Claude (gpt-4.1-nano-2025-04-14)
 * Created: 2025-07-15
 */

import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Ensure your environment variables are defined
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth credentials. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your .env file."
  );
}

// Simple configuration without custom adapter overrides
export const authOptionsSimple: AuthOptions = {
  adapter: PrismaAdapter(prisma), // Use standard adapter without overrides
  debug: true, // Enable debug logs
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code'
        }
      }
    }),
  ],
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN || undefined : undefined,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      // Simple session callback
      if (session.user) {
        session.user.id = user.id;
        // Set default credits if not present
        session.user.credits = (user as any).credits || 500;
      }
      return session;
    },
  },
  events: {
    async signIn(message: any) {
      console.log('[NextAuth][Simple][Event][signIn]', message);
    },
    async createUser(message: any) {
      console.log('[NextAuth][Simple][Event][createUser]', message);
      // Add credits to new users via a separate API call if needed
    },
  },
}; 