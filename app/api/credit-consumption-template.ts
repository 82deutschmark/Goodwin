/**
 * Credit Consumption Template for API Routes
 * 
 * This template provides a standardized approach for integrating credit consumption
 * into any API route that provides premium features. The code handles:
 * - User authentication
 * - Credit balance verification
 * - Credit deduction with proper transaction management
 * - Response handling for various scenarios including insufficient credits
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { creditService } from '@/lib/services/creditService';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const requestData = await req.json();
    
    // 2. Determine base credits needed for operation (example: model-specific cost)
    // IMPORTANT: Replace this with actual logic based on request parameters
    const baseCreditCost = 10; 
    
    // 3. Apply markup for external MCP services
    const totalCredits = creditService.calculateCreditsWithMarkup(baseCreditCost);
    
    // 4. Deduct credits and record transaction
    try {
      await creditService.deductCredits({
        userId,
        creditsToSpend: totalCredits,
        featureUsed: 'feature-name', // Replace with actual feature name
        metadataJson: JSON.stringify({
          // Add relevant operation metadata
          requestType: requestData.type,
          // other metadata...
        })
      });
    } catch (error: any) {
      if (error.message.includes('Insufficient credits')) {
        return NextResponse.json(
          { error: 'Insufficient credits. Please purchase more credits to continue.' }, 
          { status: 402 } // Payment Required
        );
      }
      throw error; // Re-throw if it's another type of error
    }
    
    // 5. Perform the actual feature operation (with external service etc.)
    // const result = await performOperation(requestData);
    
    // 6. Check if credits are low after operation
    const { credits, lowCredits } = await creditService.checkCreditBalance(userId);
    
    // 7. Return result with optional low credits warning
    return NextResponse.json({
      // result,
      credits,
      lowCredits,
      lowCreditMessage: lowCredits ? 'Your credit balance is running low. Please purchase more credits soon.' : undefined
    });
  } catch (error) {
    console.error('Error in credit consumption operation:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request.' }, 
      { status: 500 }
    );
  }
}
