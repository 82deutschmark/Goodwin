/**
 * Credit Balance Display Component
 * 
 * This component displays the user's current credit balance.
 * It can be used anywhere in the application where the credit balance needs to be shown.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface CreditBalanceDisplayProps {
  showLowCreditWarning?: boolean;
  refreshInterval?: number; // in milliseconds
  className?: string;
}

export function CreditBalanceDisplay({
  showLowCreditWarning = true,
  refreshInterval = 0, // 0 means no automatic refresh
  className = '',
}: CreditBalanceDisplayProps) {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(null);
  const [isLow, setIsLow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Function to fetch the latest credit balance
  const fetchCredits = async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        setIsLow(data.credits < 100); // Consider credits < 100 as low
      }
    } catch (error) {
      console.error('Error fetching credit balance:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch credits on initial load
  useEffect(() => {
    if (session?.user?.id) {
      fetchCredits();
    }
  }, [session?.user?.id]);

  // Set up automatic refresh if interval is provided
  useEffect(() => {
    if (refreshInterval > 0 && session?.user?.id) {
      const intervalId = setInterval(fetchCredits, refreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [refreshInterval, session?.user?.id]);

  // If no session or credits not loaded yet
  if (!session?.user?.id || credits === null) {
    return null;
  }

  return (
    <div className={`credit-balance ${className}`}>
      <div className="flex items-center">
        <span className="text-sm font-medium">
          {isLoading ? 'Updating...' : `${credits} credits`}
        </span>
        {showLowCreditWarning && isLow && (
          <span className="ml-2 text-xs text-amber-500">
            Low balance
          </span>
        )}
      </div>
      {showLowCreditWarning && isLow && (
        <a href="/buy-credits" className="text-xs text-blue-500 hover:underline">
          Buy more credits
        </a>
      )}
    </div>
  );
}

export default CreditBalanceDisplay;
