/**
 * API Route: /api/user/credit-history
 * 
 * Fetches a user's credit transaction history, including purchases,
 * spends, and adjustments. Provides a comprehensive view of credit
 * movement within the application.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    // 2. Get limit parameter from query string (default: 10)
    const url = new URL(req.url);
    const limitParam = url.searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    
    // 3. Fetch credit history from all three tables
    const [purchases, spends, adjustments] = await Promise.all([
      prisma.creditPurchase.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      }),
      prisma.creditSpend.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      }),
      prisma.creditAdjustment.findMany({
        where: { userId },
        orderBy: { timestamp: 'desc' },
        take: limit
      })
    ]);
    
    // 4. Return the credit history data
    return NextResponse.json({
      purchases,
      spends,
      adjustments
    });
  } catch (error) {
    console.error('Error fetching credit history:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching credit history' }, 
      { status: 500 }
    );
  }
}
