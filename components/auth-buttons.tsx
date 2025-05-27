// AuthButtons.tsx
// Provides styled SignIn and SignOut buttons for the application
// Author: Cascade (gpt-4.1-nano-2025-04-14)

'use client';

import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function SignInButton() {
  return (
    <Button asChild variant="default">
      <a href="/api/auth/signin" className="flex items-center gap-2">
        Sign In with Google
      </a>
    </Button>
  );
}

export function SignOutButton() {
  return (
    <Button asChild variant="outline">
      <a href="/api/auth/signout">
        Sign Out
      </a>
    </Button>
  );
}
