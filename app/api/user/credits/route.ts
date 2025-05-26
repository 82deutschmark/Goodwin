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
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

// Inline auth options since we can't import them directly
const authOptions = {
  // Add any required auth options here
  providers: [],
  callbacks: {
    async session({ session, user }: { session: any; user: any }) {
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

/**
 * GET /api/user/credits
 * Returns the current user's credit balance
 * 
 * Author: Cascade (gpt-4.1-nano-2025-04-14)
 * Last updated: 2025-05-25
 */
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return new Response(
      JSON.stringify({ error: 'You must be signed in to view credits' }),
      { status: 401, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  const user = await prisma.user.findUnique({ 
    where: { email: session.user.email },
    select: { credits: true }
  });
  
  if (!user) {
    return new Response(
      JSON.stringify({ error: 'User not found' }),
      { status: 404, headers: { 'Content-Type': 'application/json' } }
    );
  }
  
  return new Response(
    JSON.stringify({ credits: user.credits }),
    { headers: { 'Content-Type': 'application/json' } }
  );
}
