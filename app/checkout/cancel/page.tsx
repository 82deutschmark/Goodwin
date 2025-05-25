/**
 * /checkout/cancel Page
 *
 * Informs the user that the payment was canceled. Author: gpt-4.1-nano-2025-04-14
 */
'use client';
import React from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutCancelPage() {
  const router = useRouter();
  return (
    <div className="max-w-xl mx-auto py-12 text-center">
      <h1 className="text-3xl font-bold mb-4 text-red-600">Payment Canceled</h1>
      <p className="mb-6">Your payment was canceled. No credits were added.</p>
      <button
        className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
        onClick={() => router.push('/buy-credits')}
      >
        Back to Buy Credits
      </button>
    </div>
  );
}
