/**
 * NextAuth Configuration Options
 *
 * This file contains the shared authentication configuration options used across the app.
 * Extracted from the route handler to avoid Next.js route export restrictions.
 *
 * Author: GPT-4.1-nano-2025-04-14
 * Created: 2025-05-27
 */

import { AuthOptions, DefaultSession, User as NextAuthUser } from "next-auth";
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
export const authOptions: AuthOptions = {
  adapter: {
    ...adapter,
    // Override the createUser method to include initial credits
    async createUser(userData: { name?: string | null; email?: string | null; emailVerified?: Date | null; image?: string | null }) {
      try {
        console.log('[NextAuth][Adapter] Creating user with data:', JSON.stringify(userData));
        
        // Validate email exists
        if (!userData.email) {
          console.error('[NextAuth][Adapter][ERROR] No email provided in userData');
          throw new Error('Email is required for user creation');
        }
        
        // Test database connection first
        try {
          await prisma.$connect();
          console.log('[NextAuth][Adapter] Database connection successful');
        } catch (dbError) {
          console.error('[NextAuth][Adapter][ERROR] Database connection failed:', dbError);
          throw new Error('Database connection failed');
        }
        
        // Check if user with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: userData.email },
        });
        
        if (existingUser) {
          console.log('[NextAuth][Adapter] User already exists with this email, returning existing user');
          return {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email || userData.email, // Ensure email is always set
            emailVerified: existingUser.emailVerified,
            image: existingUser.image,
            credits: existingUser.credits
          } as any; // Type assertion to match AdapterUser interface
        }
        
        // Create the user with initial credits
        console.log('[NextAuth][Adapter] Creating new user...');
        const user = await prisma.user.create({
          data: {
            name: userData.name,
            email: userData.email,
            emailVerified: userData.emailVerified,
            image: userData.image,
            credits: 500, // Initial credits for new users
          },
        });
        
        console.log('[NextAuth][Adapter] User created successfully with ID:', user.id);
        
        // Return the user object in the format NextAuth expects
        return {
          id: user.id,
          name: user.name,
          email: user.email!, // Use non-null assertion since we validated email exists
          emailVerified: user.emailVerified,
          image: user.image,
          credits: user.credits
        } as any; // Type assertion to match AdapterUser interface
      } catch (error) {
        console.error('[NextAuth][Adapter][ERROR] Failed to create user:', error);
        console.error('[NextAuth][Adapter][ERROR] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          userData: JSON.stringify(userData)
        });
        throw error; // Re-throw to let NextAuth handle it
      }
    },
  },
  debug: true, // Enable debug logs in production temporarily
  providers: [
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
      authorization: {
        params: {
          prompt: 'select_account',
          access_type: 'offline',
          response_type: 'code'
          // Removed hardcoded redirect_uri - NextAuth handles this automatically
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
        secure: process.env.NODE_ENV === 'production',
        // Use specific domain for production, undefined for development
        domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN || undefined : undefined,
      },
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  // Server-side event logging for OAuth debugging
  events: {
    // Logs sign-in attempts for debugging
    async signIn(message: any) {
      console.log('[NextAuth][Event][signIn]', message);
    },
    // Logs user creation for debugging
    async createUser(message: any) {
      console.log('[NextAuth][Event][createUser]', message);
    },
    // Log session creation
    async session(message: any) {
      console.log('[NextAuth][Event][session]', message);
    },
    // Log successful sign-ins
    async linkAccount(message: any) {
      console.log('[NextAuth][Event][linkAccount]', message);
    },
  },
  // Add callbacks for better error tracking
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      console.log('[NextAuth][Callback][signIn] User:', JSON.stringify(user));
      console.log('[NextAuth][Callback][signIn] Account:', JSON.stringify(account));
      console.log('[NextAuth][Callback][signIn] Profile:', JSON.stringify(profile));
      return true; // Allow sign in
    },
    async session({ session, user }) {
      console.log('[NextAuth][Callback][session] Called with user:', JSON.stringify(user));
      // Attach userId and credits to the session for frontend use
      if (session.user) {
        session.user.id = user.id;
        session.user.credits = (user as any).credits || 0;
      }
      console.log('[NextAuth][Callback][session] Returning session:', JSON.stringify(session));
      return session;
    },
  },
};
