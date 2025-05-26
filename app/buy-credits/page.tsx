/**
 * /buy-credits Page
 *
 * Enhanced credit purchasing page with:
 * - Updated credit packages based on the Stripe webhook configuration
 * - Real-time credit balance display with auto-refresh
 * - Credit transaction history display
 * - Clear package descriptions including bonuses
 * 
 * Authors: 
 * - Initial implementation: gpt-4.1-nano-2025-04-14
 * - Enhanced with credit management system: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */
'use client';
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BuyCreditsButton from '@/components/BuyCreditsButton';
import CreditBalanceDisplay from '@/components/CreditBalanceDisplay';
import CreditHistoryDisplay from '@/components/CreditHistoryDisplay';
import { useCredits } from '@/lib/hooks/useCredits';

// Credit packages matching the ones defined in the Stripe webhook handler
interface CreditPackage {
  id: string;
  credits: number;
  bonus: number;
  total: number;
  price: string;
  priceId: string;
  description?: string;
}

// These should match the configuration in app/api/stripe/webhook/route.ts
const creditPackages: CreditPackage[] = [
  { 
    id: 'starter', 
    credits: 1000, 
    bonus: 0, 
    total: 1000, 
    price: '$10', 
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_1000 || '', 
    description: 'Perfect for getting started with basic features'
  },
  { 
    id: 'plus', 
    credits: 5000, 
    bonus: 50, 
    total: 5050, 
    price: '$50', 
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_5050 || '',
    description: 'Great value with bonus credits'
  },
  { 
    id: 'pro', 
    credits: 10000, 
    bonus: 1000, 
    total: 11000, 
    price: '$100', 
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_11000 || '',
    description: 'For power users with 10% bonus credits'
  },
  { 
    id: 'business', 
    credits: 20000, 
    bonus: 3000, 
    total: 23000, 
    price: '$200', 
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_23000 || '',
    description: 'Best value for teams with 15% bonus credits'
  },
  { 
    id: 'premium', 
    credits: 50000, 
    bonus: 12500, 
    total: 62500, 
    price: '$500', 
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_62500 || '',
    description: 'Premium package with 25% bonus credits'
  },
  { 
    id: 'enterprise', 
    credits: 100000, 
    bonus: 40000, 
    total: 140000, 
    price: '$1,000', 
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_140000 || '',
    description: 'Enterprise solution with 40% bonus credits'
  },
];

export default function BuyCreditsPage() {
  const { credits } = useCredits();
  const [activeTab, setActiveTab] = useState("packages");

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <h1 className="text-3xl font-bold">Credits</h1>
        <CreditBalanceDisplay className="mt-2 md:mt-0" showLowCreditWarning={false} />
      </div>
      
      <Tabs defaultValue="packages" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="packages">Buy Credits</TabsTrigger>
          <TabsTrigger value="history">Transaction History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="packages">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {creditPackages.map(pkg => (
              <div key={pkg.id} className="flex flex-col p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="mb-4">
                  <h3 className="text-xl font-bold">{pkg.id.charAt(0).toUpperCase() + pkg.id.slice(1)}</h3>
                  <div className="text-sm text-gray-500 mt-1">{pkg.description}</div>
                </div>
                
                <div className="flex-grow">
                  <div className="text-3xl font-bold text-blue-600">{pkg.total.toLocaleString()}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {pkg.credits.toLocaleString()} credits
                    {pkg.bonus > 0 && (
                      <span className="text-green-600 font-medium"> + {pkg.bonus.toLocaleString()} bonus</span>
                    )}
                  </div>
                  <div className="text-lg font-semibold mt-4">{pkg.price}</div>
                </div>
                
                <div className="mt-6">
                  <BuyCreditsButton priceId={pkg.priceId}>
                    Purchase
                  </BuyCreditsButton>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <div className="border rounded-lg p-6">
            <CreditHistoryDisplay limit={20} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
