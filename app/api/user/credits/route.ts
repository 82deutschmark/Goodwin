/**
 * /api/user/credits route
 *
 * Returns the current user's credit balance.
 *
 * Author: Cascade (gpt-4.1-nano-2025-04-14)
 * Last updated: 2025-05-25
 *
 * Notes: Updated prisma import to named export for compatibility. Lint-free.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  return NextResponse.json({ credits: user.credits }, { status: 200 });
}
