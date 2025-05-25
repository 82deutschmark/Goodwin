/**
 * Mr. Goodwin API Endpoint
 * 
 * This is the ONLY endpoint users should interact with directly.
 * It provides access to Mr. Goodwin, who orchestrates all specialized
 * servants behind the scenes, creating a unified household staff experience.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { goodwinService } from '@/lib/services/goodwinService';

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
    
    // 3. Process the request through Mr. Goodwin
    try {
      const result = await goodwinService.processRequest({
        query: requestData.query,
        imageUrls: requestData.imageUrls,
        userId,
        sessionId: requestData.sessionId || Date.now().toString(),
      });
      
      // 4. Return Goodwin's response with credit information (hidden from user UI)
      return NextResponse.json({
        response: result.response,
        credits: result.credits,
        lowCredits: result.lowCredits,
        lowCreditMessage: result.lowCreditMessage,
      });
    } catch (error: any) {
      if (error.message.includes('Insufficient credits')) {
        return NextResponse.json(
          { 
            error: 'Insufficient credits', 
            response: "I do apologize, sir/madam, but it appears the household account has insufficient funds at present. Might I suggest a modest replenishment to continue providing our services?"
          }, 
          { status: 402 } // Payment Required
        );
      }
      throw error; // Re-throw if it's another type of error
    }
  } catch (error) {
    console.error('Error in Goodwin service:', error);
    return NextResponse.json(
      { 
        error: 'Service temporarily unavailable',
        response: "I do apologize, sir/madam, but I seem to be experiencing some difficulty at present. Perhaps we might try again in a moment?"
      }, 
      { status: 500 }
    );
  }
}
