/**
 * TypeScript type augmentation for NextAuth
 *
 * This file extends the NextAuth Session and User types to include
 * custom fields (id, credits) on the session.user object.
 *
 * Author: gpt-4.1-nano-2025-04-14
 */

import NextAuth, { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      credits: number;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    credits: number;
  }
}
