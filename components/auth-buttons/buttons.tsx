// AuthButtons.tsx
// Provides styled SignIn and SignOut buttons for the application
// Author: DeepSeek V3 (0324)

'use client';

import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function SignInButton() {
  return (
    <Button asChild variant="default">
      <Link href="/api/auth/signin" className="flex items-center gap-2">
        Sign In with Google
      </Link>
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button asChild variant="outline">
      <Link href="/api/auth/signout">
        Sign Out
      </Link>
    </Button>
  );
}
