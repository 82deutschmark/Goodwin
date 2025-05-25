/**
 * /checkout/success Page
 *
 * Informs the user of a successful credit purchase and prompts balance refresh. Author: gpt-4.1-nano-2025-04-14
 */
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();

  // Optionally, trigger a session or balance refresh here

  return (
    <div className="max-w-xl mx-auto py-12 text-center">
      <h1 className="text-3xl font-bold mb-4 text-green-600">Payment Successful!</h1>
      <p className="mb-6">Your credits have been added to your account.</p>
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
        onClick={() => router.push('/buy-credits')}
      >
        Back to Buy Credits
      </button>
    </div>
  );
}
