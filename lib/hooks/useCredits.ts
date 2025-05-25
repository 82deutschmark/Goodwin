/**
 * Credit Management Hook
 * 
 * This React hook provides a simple interface for accessing and refreshing 
 * a user's credit balance on the client side. It handles loading states, 
 * error handling, and provides functions for checking credit balance.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';

interface UseCreditsReturn {
  credits: number | null;
  isLoading: boolean;
  error: string | null;
  isLowBalance: boolean;
  refreshCredits: () => Promise<void>;
  hasEnoughCredits: (required: number) => boolean;
}

export function useCredits(autoRefreshInterval = 0): UseCreditsReturn {
  const { data: session } = useSession();
  const [credits, setCredits] = useState<number | null>(session?.user?.credits || null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLowBalance, setIsLowBalance] = useState(false);

  // Function to refresh credit balance from server
  const refreshCredits = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/user/credits');
      if (response.ok) {
        const data = await response.json();
        setCredits(data.credits);
        setIsLowBalance(data.credits < 100); // Consider less than 100 as low balance
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch credit balance');
      }
    } catch (error: any) {
      console.error('Error fetching credit balance:', error);
      setError('An error occurred while fetching credit balance');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id]);

  // Check if the user has enough credits
  const hasEnoughCredits = useCallback((required: number) => {
    if (credits === null) return false;
    return credits >= required;
  }, [credits]);

  // Fetch credits on initial load and when session changes
  useEffect(() => {
    if (session?.user?.id) {
      refreshCredits();
    }
  }, [session?.user?.id, refreshCredits]);

  // Set up auto-refresh if enabled
  useEffect(() => {
    if (autoRefreshInterval > 0 && session?.user?.id) {
      const intervalId = setInterval(refreshCredits, autoRefreshInterval);
      return () => clearInterval(intervalId);
    }
  }, [autoRefreshInterval, session?.user?.id, refreshCredits]);

  return {
    credits,
    isLoading,
    error,
    isLowBalance,
    refreshCredits,
    hasEnoughCredits,
  };
}
