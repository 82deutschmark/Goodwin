/**
 * NextAuth Configuration for Google OAuth + Prisma Adapter
 *
 * - Uses Google as the authentication provider.
 * - Uses Prisma Adapter for Postgres (Vercel Postgres) to persist users, sessions, and accounts.
 * - Session callback includes userId and credits for use in the frontend.
 * - Fixed race condition in user creation and credit assignment.
 *
 * Updated for Next.js App Router and NextAuth v5
 * Last updated: 2025-05-27
 */

import NextAuth, { AuthOptions, DefaultSession, User as NextAuthUser } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

// Extend the default Session and User types to include our custom fields
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      credits: number;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    credits: number;
    email?: string | null;
    name?: string | null;
    image?: string | null;
  }
}

// Type for the user data we expect from the database
type DatabaseUser = {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
  credits: number;
};

// Ensure your environment variables are defined
const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

if (!googleClientId || !googleClientSecret) {
  throw new Error(
    "Missing Google OAuth credentials. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in your .env file."
  );
}

const adapter = PrismaAdapter(prisma);

// Configuration options for NextAuth
const authOptions: AuthOptions = {
  adapter: {
    ...adapter,
    // Override the createUser method to include initial credits
    async createUser(userData: { name?: string | null; email?: string | null; emailVerified?: Date | null; image?: string | null }) {
      try {
        console.log('[NextAuth][Adapter] Creating user with data:', JSON.stringify(userData));
        
        // Check if user with this email already exists
        if (userData.email) {
          const existingUser = await prisma.user.findUnique({
            where: { email: userData.email },
          });
          
          if (existingUser) {
            console.log('[NextAuth][Adapter] User already exists with this email, returning existing user');
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email || "", // Ensure email is string not undefined
              emailVerified: existingUser.emailVerified,
              image: existingUser.image || null,
              credits: existingUser.credits
            };
          }
        }
        
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
        
        console.log('[NextAuth][Adapter] User created successfully with ID:', user.id);
        
        // Return the user object
        return {
          id: user.id,
          name: user.name,
          email: user.email || "", // Ensure email is string not undefined
          emailVerified: user.emailVerified,
          image: user.image || null,
          credits: user.credits
        };
      } catch (error) {
        console.error('[NextAuth][Adapter][ERROR] Failed to create user:', error);
        throw error; // Re-throw to let NextAuth handle it
      }
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
          redirect_uri: 'https://www.gptpluspro.com/api/auth/callback/google'
        }
      }
    }),
  ],
  // Allow requests from our known domains
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: true,
        domain: process.env.NODE_ENV === 'production' ? '.gptpluspro.com' : undefined, // Subdomain-capable cookie in production
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async session({ session, user }) {
      // Attach userId and credits to the session for frontend use
      if (session.user) {
        session.user.id = user.id;
        session.user.credits = (user as any).credits || 0;
      }
      return session;
    },
  },
  // Server-side event logging for OAuth debugging (Gemini 2.5 Pro, 2025-05-26)
  // Server-side event logging for OAuth debugging (Gemini 2.5 Pro, 2025-05-26)
  events: {
    // Logs sign-in attempts for debugging
    async signIn(message: any) {
      console.log('[NextAuth][Event][signIn]', message);
    },
    // Logs user creation for debugging
    async createUser(message: any) {
      console.log('[NextAuth][Event][createUser]', message);
    },
  },
};

// Create the handler with the auth options
const handler = NextAuth(authOptions);

// Export the handler for GET and POST requests - this is required for Next.js App Router
export { handler as GET, handler as POST, authOptions };