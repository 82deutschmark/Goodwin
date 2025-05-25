/**
 * Mechanic Service - Integration with Mr. Gearhart specialized assistant
 * 
 * This service provides technical assistance for mechanical repairs and maintenance.
 * It integrates with vector stores to maintain a knowledge base of manuals, parts,
 * and solutions to common problems.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import OpenAI from 'openai';
import { mcpService, MCP_COSTS } from './mcpService';
import { creditService } from './creditService';

// Configure OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for mechanic assistance requests
export interface MechanicRequestOptions {
  query: string;
  imageUrls?: string[];
  modelName?: string;
  modelYear?: string;
  vectorStoreId?: string; // Optional ID of a specific vector store to search
}

export interface MechanicResponse {
  response: string;
  sourcedReferences: {
    title: string;
    content: string;
    source: string;
  }[];
  suggestedParts?: {
    name: string;
    partNumber: string;
    estimatedPrice?: string;
  }[];
}

export class MechanicService {
  /**
   * Get assistance from Mr. Gearhart for mechanical issues
   * Automatically handles credit deduction and recording
   */
  async getAssistance(userId: string, options: MechanicRequestOptions): Promise<{
    mechanicResponse: MechanicResponse;
    credits: number;
    lowCredits: boolean;
  }> {
    // Calculate base cost
    let baseCost = MCP_COSTS.MECHANIC_ASSISTANT.BASE_COST;
    
    // Add cost for image analysis if provided
    if (options.imageUrls && options.imageUrls.length > 0) {
      baseCost += options.imageUrls.length * MCP_COSTS.MECHANIC_ASSISTANT.IMAGE_ANALYSIS;
    }
    
    // Calculate total cost with markup
    const totalCost = creditService.calculateCreditsWithMarkup(baseCost);
    
    // Check if user has enough credits
    const hasEnoughCredits = await creditService.hasEnoughCredits(userId, totalCost);
    if (!hasEnoughCredits) {
      throw new Error(`Insufficient credits. Required: ${totalCost}`);
    }
    
    try {
      // Create context for Mr. Gearhart
      const context = this.buildContext(options);
      
      // Retrieve relevant documents from vector store if available
      let vectorStoreResults = [];
      if (options.vectorStoreId) {
        vectorStoreResults = await this.searchVectorStore(options.vectorStoreId, options.query);
      }
      
      // Generate system message with context and vector store results
      const systemMessage = this.buildSystemMessage(context, vectorStoreResults);
      
      // Get assistance from OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14", // Use the preferred model
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: options.query }
        ],
        temperature: 0.2, // Lower temperature for more factual responses
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
      });
      
      // Process the response to extract structured data
      const mechanicResponse = this.processResponse(response.choices[0].message.content || '');
      
      // Record the operation and deduct credits
      await mcpService.recordOperation(userId, {
        server: 'MECHANIC_ASSISTANT',
        operation: 'MR_GEARHART',
        baseCost,
        metadata: {
          query: options.query,
          modelName: options.modelName,
          modelYear: options.modelYear,
          imageCount: options.imageUrls?.length || 0
        }
      });
      
      // Check if credits are low after the operation
      const { credits, lowCredits } = await creditService.checkCreditBalance(userId);
      
      return {
        mechanicResponse,
        credits,
        lowCredits
      };
    } catch (error) {
      console.error('Error getting mechanic assistance:', error);
      throw new Error('Failed to get mechanic assistance. Please try again later.');
    }
  }
  
  /**
   * Build context for Mr. Gearhart based on request options
   */
  private buildContext(options: MechanicRequestOptions): string {
    let context = "You are Mr. Gearhart, a specialized mechanic assistant with extensive knowledge of equipment, vehicles, and repair procedures. ";
    
    if (options.modelName) {
      context += `The user is inquiring about a ${options.modelYear || ''} ${options.modelName}. `;
    }
    
    if (options.imageUrls && options.imageUrls.length > 0) {
      context += `The user has provided ${options.imageUrls.length} image(s) of the equipment or issue. `;
    }
    
    return context;
  }
  
  /**
   * Build system message with context and vector store results
   */
  private buildSystemMessage(context: string, vectorStoreResults: any[]): string {
    let systemMessage = context + "\n\n";
    
    if (vectorStoreResults.length > 0) {
      systemMessage += "REFERENCE MATERIALS:\n";
      vectorStoreResults.forEach((result, index) => {
        systemMessage += `[${index + 1}] ${result.title || 'Document'}: ${result.content}\nSource: ${result.source || 'Unknown'}\n\n`;
      });
    }
    
    systemMessage += "Please provide a helpful, detailed response that includes:\n";
    systemMessage += "1. A diagnosis of the problem based on the description and any images\n";
    systemMessage += "2. Step-by-step instructions for repair or maintenance\n";
    systemMessage += "3. Safety precautions when applicable\n";
    systemMessage += "4. Required tools and parts with specific part numbers when possible\n";
    systemMessage += "5. Alternative solutions if available\n\n";
    systemMessage += "Format your response for structured extraction of referenced materials and part suggestions.";
    
    return systemMessage;
  }
  
  /**
   * Process the raw response from OpenAI to extract structured data
   */
  private processResponse(rawResponse: string): MechanicResponse {
    // Extract referenced materials and part suggestions
    // This is a simplified implementation - a more robust parser would be needed in production
    const sourcedReferences: Array<{title: string; content: string; source: string}> = [];
    const suggestedParts: Array<{name: string; partNumber: string; estimatedPrice?: string}> = [];
    
    // Basic extraction of parts (in a real implementation, this would be more sophisticated)
    const partsSection = rawResponse.match(/(?:parts needed|required parts|suggested parts):([\s\S]*?)(?:\n\n|\n#|\n\*\*|$)/i);
    if (partsSection && partsSection[1]) {
      const partLines = partsSection[1].split('\n').filter(line => line.trim().length > 0);
      partLines.forEach(line => {
        const partMatch = line.match(/[\-\*]?\s*([^-:]+)(?:[-:]\s*(?:Part\s*(?:No|Number|#)?[.:])?\s*([A-Z0-9\-]+))?(?:[,:\s]+\$?(\d+(?:\.\d{2})?))?\s*$/i);
        if (partMatch) {
          suggestedParts.push({
            name: partMatch[1].trim(),
            partNumber: partMatch[2] ? partMatch[2].trim() : 'Unknown',
            estimatedPrice: partMatch[3] ? `$${partMatch[3]}` : undefined
          });
        }
      });
    }
    
    // Return structured response
    return {
      response: rawResponse,
      sourcedReferences,
      suggestedParts: suggestedParts.length > 0 ? suggestedParts : undefined
    };
  }
  
  /**
   * Search vector store for relevant documents
   */
  private async searchVectorStore(vectorStoreId: string, query: string): Promise<any[]> {
    try {
      // Implement vector store search logic here
      // This is a placeholder for the actual implementation
      return [];
    } catch (error) {
      console.error('Error searching vector store:', error);
      return [];
    }
  }
  
  /**
   * Create a new vector store for a specific equipment model or manual
   */
  async createEquipmentVectorStore(userId: string, name: string, files: any[]): Promise<string> {
    // Calculate base cost
    const baseCost = MCP_COSTS.MECHANIC_ASSISTANT.VECTOR_STORE_CREATION;
    
    // Calculate total cost with markup
    const totalCost = creditService.calculateCreditsWithMarkup(baseCost);
    
    // Check if user has enough credits
    const hasEnoughCredits = await creditService.hasEnoughCredits(userId, totalCost);
    if (!hasEnoughCredits) {
      throw new Error(`Insufficient credits. Required: ${totalCost}`);
    }
    
    try {
      // Placeholder for vector store creation logic
      // In a real implementation, this would create a vector store in OpenAI
      
      // Record the operation and deduct credits
      await mcpService.recordOperation(userId, {
        server: 'MECHANIC_ASSISTANT',
        operation: 'CREATE_VECTOR_STORE',
        baseCost,
        metadata: {
          name,
          fileCount: files.length
        }
      });
      
      // Return a placeholder vector store ID
      return `vs_${Date.now()}`;
    } catch (error) {
      console.error('Error creating vector store:', error);
      throw new Error('Failed to create vector store. Please try again later.');
    }
  }
}

// Singleton instance for use throughout the application
export const mechanicService = new MechanicService();
