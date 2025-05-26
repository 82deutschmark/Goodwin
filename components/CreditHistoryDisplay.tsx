/**
 * Credit History Display Component
 *
 * This component displays a user's credit transaction history, including
 * purchases, consumption, and adjustments. It provides a clear view of
 * how credits are being used throughout the application.
 *
 * Author: Cascade (gpt-4.1-nano-2025-04-14)
 * Last updated: 2025-05-25
 *
 * Notes: Fixed React Hook dependency warnings and removed unused variable. Lint-free.
 */

"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { formatDistanceToNow } from 'date-fns';

interface CreditHistoryProps {
  limit?: number;
  className?: string;
}

export function CreditHistoryDisplay({
  limit = 10,
  className = '',
}: CreditHistoryProps) {
  const { data: session } = useSession();
  const [history, setHistory] = useState<{
    purchases: any[];
    spends: any[];
    adjustments: any[];
  }>({
    purchases: [],
    spends: [],
    adjustments: []
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch credit history
  const fetchHistory = useCallback(async () => {
    if (!session?.user?.id) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/user/credit-history?limit=${limit}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to fetch credit history');
      }
    } catch (error) {
      console.error('Error fetching credit history:', error);
      setError('An error occurred while fetching credit history');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, limit]);

  // Fetch history on initial load
  useEffect(() => {
    if (session?.user?.id) {
      fetchHistory();
    }
  }, [session?.user?.id, limit, fetchHistory]);

  if (!session?.user?.id) {
    return null;
  }

  // Format the date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className={`credit-history ${className}`}>
      <h2 className="text-xl font-semibold mb-4">Credit History</h2>
      
      {isLoading && <p>Loading credit history...</p>}
      
      {error && (
        <div className="text-red-500 mb-4">
          {error}
        </div>
      )}
      
      {!isLoading && !error && (
        <div>
          {/* Purchases */}
          {history.purchases.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Purchases</h3>
              <ul className="space-y-2">
                {history.purchases.map((purchase) => (
                  <li key={purchase.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-green-600">+{purchase.creditsPurchased} credits</span>
                      <span className="text-sm text-gray-500">{formatDate(purchase.createdAt)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {(purchase.amountPaid / 100).toFixed(2)} {purchase.currency.toUpperCase()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Spends */}
          {history.spends.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Usage</h3>
              <ul className="space-y-2">
                {history.spends.map((spend) => (
                  <li key={spend.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-red-600">-{spend.creditsSpent} credits</span>
                      <span className="text-sm text-gray-500">{formatDate(spend.createdAt)}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      {spend.featureUsed}
                      {spend.metadata && (
                        <span className="ml-2 text-xs text-gray-400">
                          {JSON.stringify(JSON.parse(spend.metadata), null, 0).substring(0, 50)}
                          {JSON.stringify(JSON.parse(spend.metadata), null, 0).length > 50 ? '...' : ''}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* Adjustments */}
          {history.adjustments.length > 0 && (
            <div>
              <h3 className="text-lg font-medium mb-2">Adjustments</h3>
              <ul className="space-y-2">
                {history.adjustments.map((adjustment) => (
                  <li key={adjustment.id} className="border-b pb-2">
                    <div className="flex justify-between">
                      <span className={`font-medium ${adjustment.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {adjustment.amount > 0 ? '+' : ''}{adjustment.amount} credits
                      </span>
                      <span className="text-sm text-gray-500">{formatDate(adjustment.createdAt)}</span>
                    </div>
                    {adjustment.reason && (
                      <div className="text-sm text-gray-600">
                        {adjustment.reason}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {/* No history case */}
          {history.purchases.length === 0 && history.spends.length === 0 && history.adjustments.length === 0 && (
            <p className="text-gray-500">No credit transactions found.</p>
          )}
        </div>
      )}
      
      <button 
        onClick={fetchHistory}
        disabled={isLoading}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Refreshing...' : 'Refresh'}
      </button>
    </div>
  );
}

export default CreditHistoryDisplay;
