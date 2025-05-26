/**
 * NextAuth Configuration for Google OAuth + Prisma Adapter
 *
 * - Uses Google as the authentication provider.
 * - Uses Prisma Adapter for Postgres (Vercel Postgres) to persist users, sessions, and accounts.
 * - Session callback includes userId and credits for use in the frontend.
 * - Fixed race condition in user creation and credit assignment.
 *
 * Author: Cascade (gpt-4.1-nano-2025-04-14)
 * Last updated: 2025-05-26
 *
 * Notes: Removed unused variables in signIn callback. Lint-free.
 */

import NextAuth, { type NextAuthOptions } from "next-auth";
import type { AdapterUser as BaseAdapterUser } from "next-auth/adapters";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Extend the default AdapterUser type to include credits
interface AdapterUser extends BaseAdapterUser {
  credits: number;
}

// Import Prisma types
type PrismaUser = {
  id: string;
  name?: string | null;
  email?: string | null;
  emailVerified?: Date | null;
  image?: string | null;
  credits: number;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      credits: number;
      email?: string | null;
      name?: string | null;
      image?: string | null;
    };
  }
}

// Ensure your environment variables are defined
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth credentials. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your .env file."
  );
}

const adapter = PrismaAdapter(prisma);

const authOptions: NextAuthOptions = {
  adapter: {
    ...adapter,
    // Override the createUser method to include initial credits
    async createUser(userData: { name?: string | null; email?: string | null; emailVerified?: Date | null; image?: string | null }): Promise<AdapterUser> {
      // Create the user with initial credits
      const user = await prisma.user.create({
        data: {
          name: userData.name || null,
          email: userData.email || null,
          emailVerified: userData.emailVerified || null,
          image: userData.image || null,
          credits: 500, // Initial credits for new users
        },
      });
      // Convert to AdapterUser type
      return {
        id: user.id,
        name: user.name,
        email: user.email || undefined,
        emailVerified: user.emailVerified,
        image: user.image || undefined,
        credits: user.credits
      } as AdapterUser;
    },
  },
  debug: process.env.NODE_ENV === 'development',
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code',
          redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'https://gptpluspro.com/api/auth/callback/google'
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      // Attach userId and credits to the session for frontend use
      if (session.user) {
        session.user.id = user.id;
        session.user.credits = (user as PrismaUser).credits || 0;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };