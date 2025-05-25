/**
 * Image Generation API Endpoint
 * 
 * This endpoint provides image generation using OpenAI's DALL-E model
 * while automatically handling credit consumption and tracking.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { imageGenerationService } from '@/lib/services/imageGenerationService';

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
    if (!requestData.prompt) {
      return NextResponse.json({ error: 'Prompt is required' }, { status: 400 });
    }
    
    // 3. Generate images and handle credit deduction
    try {
      const result = await imageGenerationService.generateImages(userId, {
        prompt: requestData.prompt,
        numberOfImages: requestData.numberOfImages,
        size: requestData.size,
        quality: requestData.quality,
        style: requestData.style,
      });
      
      // 4. Return images with credit information
      return NextResponse.json({
        images: result.images,
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
    console.error('Error in image generation:', error);
    return NextResponse.json(
      { error: 'An error occurred while generating images.' }, 
      { status: 500 }
    );
  }
}
