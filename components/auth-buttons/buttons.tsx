// AuthButtons.tsx
// Provides styled SignIn and SignOut buttons for the application
// Author: DeepSeek V3 (0324)

'use client';

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
