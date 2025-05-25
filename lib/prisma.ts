/**
 * Prisma Client Instance
 * 
 * This file creates and exports a singleton Prisma client instance to be used
 * throughout the application. It handles connection pooling and prevents
 * multiple instances in development due to hot reloading.
 * 
 * Author: gpt-4.1-nano-2025-04-14
 */

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
