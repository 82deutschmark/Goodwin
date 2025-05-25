/**
 * Image Generation Service - Integration with Mr. Brightwell specialized assistant
 * 
 * This service handles image generation requests, coordinates with the MCP service
 * for proper credit tracking, and ensures all operations are properly recorded.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import { Configuration, OpenAIApi } from 'openai';
import { mcpService } from './mcpService';
import { creditService } from './creditService';

// Configure OpenAI API client
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export interface ImageGenerationOptions {
  prompt: string;
  numberOfImages?: number;
  size?: '256x256' | '512x512' | '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  style?: 'natural' | 'vivid';
  responseFormat?: 'url' | 'b64_json';
}

export class ImageGenerationService {
  /**
   * Generate images using OpenAI's DALL-E model
   * Automatically handles credit deduction and recording
   */
  async generateImages(userId: string, options: ImageGenerationOptions): Promise<{
    images: string[];
    credits: number;
    lowCredits: boolean;
  }> {
    // Set default values
    const numberOfImages = options.numberOfImages || 1;
    const size = options.size || '1024x1024';
    const quality = options.quality || 'standard';
    const style = options.style || 'natural';
    
    // Calculate base cost based on options
    let baseCost = mcpService.MCP_COSTS.IMAGE_GENERATION.BASE_COST;
    
    // Adjust cost based on size and quality
    if (size === '1792x1024' || size === '1024x1792') {
      baseCost = mcpService.MCP_COSTS.IMAGE_GENERATION.HIGH_RESOLUTION;
    }
    
    if (quality === 'hd') {
      baseCost *= 1.5; // 50% more for HD quality
    }
    
    // Multiply by number of images
    baseCost *= numberOfImages;
    
    // Calculate total cost with markup
    const totalCost = creditService.calculateCreditsWithMarkup(baseCost);
    
    // Check if user has enough credits
    const hasEnoughCredits = await creditService.hasEnoughCredits(userId, totalCost);
    if (!hasEnoughCredits) {
      throw new Error(`Insufficient credits. Required: ${totalCost}`);
    }
    
    try {
      // Generate images using OpenAI API
      const response = await openai.createImage({
        prompt: options.prompt,
        n: numberOfImages,
        size: size,
        quality: quality,
        style: style,
        response_format: options.responseFormat || 'url',
      });
      
      // Record the operation and deduct credits
      await mcpService.recordOperation(userId, {
        server: 'IMAGE_GENERATION',
        operation: 'DALLE',
        baseCost,
        metadata: {
          prompt: options.prompt,
          numberOfImages,
          size,
          quality,
          style
        }
      });
      
      // Check if credits are low after the operation
      const { credits, lowCredits } = await creditService.checkCreditBalance(userId);
      
      // Extract image URLs from the response
      const images = response.data.data.map(item => {
        return options.responseFormat === 'b64_json' ? item.b64_json! : item.url!;
      });
      
      return {
        images,
        credits,
        lowCredits
      };
    } catch (error) {
      console.error('Error generating images:', error);
      throw new Error('Failed to generate images. Please try again later.');
    }
  }
}

// Singleton instance for use throughout the application
export const imageGenerationService = new ImageGenerationService();
