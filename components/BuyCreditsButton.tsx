/**
 * BuyCreditsButton Component
 *
 * Renders a button to initiate a Stripe Checkout session for purchasing credits.
 * Handles loading, errors, and redirects to Stripe Checkout.
 * Modular and reusable. Author: gpt-4.1-nano-2025-04-14
 */
'use client';
import React, { useState } from 'react';

interface BuyCreditsButtonProps {
  priceId: string;
  children?: React.ReactNode;
}

const BuyCreditsButton: React.FC<BuyCreditsButtonProps> = ({ priceId, children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleBuy = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const data = await res.json();
      if (!res.ok || !data.sessionId) throw new Error(data.error || 'Failed to create session');
      // Redirect to Stripe Checkout
      window.location.href = `https://checkout.stripe.com/pay/${data.sessionId}`;
    } catch (err: any) {
      setError(err.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50"
    >
      {loading ? 'Processing...' : children || 'Buy Credits'}
      {error && <span className="text-red-500 ml-2">{error}</span>}
    </button>
  );
};

export default BuyCreditsButton;
