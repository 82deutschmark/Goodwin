'use client';

import { signIn, signOut, useSession } from 'next-auth/react';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { Button } from './ui/button';

export function AuthButton() {
  const { data: session, status } = useSession();
  const isLoading = status === 'loading';

  if (isLoading) {
    return (
      <Button variant="ghost" size="sm" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Loading...
      </Button>
    );
  }

  if (session) {
    return (
      <Button 
        variant="ghost" 
        size="sm" 
        onClick={() => signOut({ callbackUrl: '/' })}
        className="text-sm"
      >
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className="text-sm"
    >
      <LogIn className="mr-2 h-4 w-4" />
      Sign in with Google
    </Button>
  );
}
