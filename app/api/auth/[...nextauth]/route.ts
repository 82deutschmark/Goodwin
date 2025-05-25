/**
 * NextAuth Configuration for Google OAuth + Prisma Adapter
 *
 * - Uses Google as the authentication provider.
 * - Uses Prisma Adapter for Postgres (Vercel Postgres) to persist users, sessions, and accounts.
 * - Session callback includes userId and credits for use in the frontend.
 * - Author: gpt-4.1-nano-2025-04-14
 */

import NextAuth from "next-auth";
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

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // Award 500 credits to new users upon their first Google OAuth login
      if (user && !user.credits) {
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: 500 },
        });
      }
      return true;
    },
    async session({ session, user }) {
      // Attach userId and credits to the session for frontend use
      if (session.user && user) {
        session.user.id = user.id;
        session.user.credits = user.credits;
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST }; 