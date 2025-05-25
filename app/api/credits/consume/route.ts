/**
 * /api/credits/consume route
 *
 * Consumes a specified amount of credits from the current user. Author: gpt-4.1-nano-2025-04-14
 */
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { amount } = await req.json();
  if (typeof amount !== 'number' || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user || user.credits < amount) {
    return NextResponse.json({ error: 'Insufficient credits' }, { status: 400 });
  }
  await prisma.user.update({
    where: { id: session.user.id },
    data: { credits: { decrement: amount } },
  });
  return NextResponse.json({ success: true }, { status: 200 });
}
