/**
 * Prisma Client Instance
 * 
 * This file creates and exports a singleton Prisma client instance to be used
 * throughout the application. It handles connection pooling and prevents
 * multiple instances in development due to hot reloading.
 * 
 * Author: gpt-4.1-nano-2025-04-14
 * Updated: 2025-05-25 by Claude 3.5 Sonnet - Fixed compatibility with Prisma v5.17.0/6.8.2
 */

import { PrismaClient } from '@prisma/client'

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
const globalForPrisma = global as unknown as { prisma: PrismaClient | undefined }

// Export a singleton PrismaClient instance
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
