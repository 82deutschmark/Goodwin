/**
 * Mechanic Assistant API Endpoint (Mr. Gearhart)
 * 
 * This endpoint provides mechanical assistance through Mr. Gearhart,
 * a specialized assistant for repairs and technical issues.
 * It handles credit consumption and vector store integration.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { mechanicService } from '@/lib/services/mechanicService';

export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const userId = session.user.id;
    const requestData = await req.json();
    
    // 2. Validate request data
    if (!requestData.query) {
      return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    }
    
    // 3. Get mechanical assistance and handle credit deduction
    try {
      const result = await mechanicService.getAssistance(userId, {
        query: requestData.query,
        imageUrls: requestData.imageUrls,
        modelName: requestData.modelName,
        modelYear: requestData.modelYear,
        vectorStoreId: requestData.vectorStoreId
      });
      
      // 4. Return assistance with credit information
      return NextResponse.json({
        response: result.mechanicResponse.response,
        sourcedReferences: result.mechanicResponse.sourcedReferences,
        suggestedParts: result.mechanicResponse.suggestedParts,
        credits: result.credits,
        lowCredits: result.lowCredits,
        lowCreditMessage: result.lowCredits ? 'Your credit balance is running low. Please purchase more credits soon.' : undefined
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
  } catch (error) {
    console.error('Error in mechanic assistance:', error);
    return NextResponse.json(
      { error: 'An error occurred while getting mechanic assistance.' }, 
      { status: 500 }
    );
  }
}
