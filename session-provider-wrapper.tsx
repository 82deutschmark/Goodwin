// SessionProviderWrapper.tsx
// Wraps the application with NextAuth session provider while avoiding client-side hydration issues
// Author: DeepSeek V3 (0324)

'use client';

import { SessionProvider } from 'next-auth/react';

export default function SessionProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <SessionProvider>{children}</SessionProvider>;
}
