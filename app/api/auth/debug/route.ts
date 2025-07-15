/**
 * Debug route for diagnosing OAuth and database issues
 * 
 * This route helps troubleshoot common NextAuth OAuth problems.
 * IMPORTANT: Remove or disable this route in production!
 * 
 * Author: Claude (gpt-4.1-nano-2025-04-14)
 * Created: 2025-07-15
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    checks: {
      environmentVariables: {
        GOOGLE_CLIENT_ID: !!process.env.GOOGLE_CLIENT_ID ? '✅ Set' : '❌ Missing',
        GOOGLE_CLIENT_SECRET: !!process.env.GOOGLE_CLIENT_SECRET ? '✅ Set' : '❌ Missing',
        NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET ? '✅ Set' : '❌ Missing',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || '❌ Not set',
        DATABASE_URL: !!process.env.DATABASE_URL ? '✅ Set' : '❌ Missing',
      },
      googleClientId: {
        length: process.env.GOOGLE_CLIENT_ID?.length || 0,
        endsWithGoogleusercontent: process.env.GOOGLE_CLIENT_ID?.endsWith('.googleusercontent.com') ? '✅ Valid format' : '❌ Invalid format',
      },
      nextAuthSecret: {
        length: process.env.NEXTAUTH_SECRET?.length || 0,
        isValid: (process.env.NEXTAUTH_SECRET?.length || 0) >= 32 ? '✅ Good length' : '❌ Too short (needs 32+ chars)',
      },
    },
    database: {
      status: 'checking...',
      error: null as string | null,
    },
  };

  // Test database connection
  try {
    await prisma.$connect();
    await prisma.user.findFirst();
    diagnostics.database.status = '✅ Connected successfully';
  } catch (error) {
    diagnostics.database.status = '❌ Connection failed';
    diagnostics.database.error = error instanceof Error ? error.message : 'Unknown error';
  } finally {
    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect errors
    }
  }

  return NextResponse.json(diagnostics, { 
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
} 