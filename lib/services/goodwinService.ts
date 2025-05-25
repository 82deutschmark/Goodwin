/**
 * Mr. Goodwin Service - Central Butler/Orchestrator
 * 
 * This service acts as the central orchestrator for all user interactions.
 * Users only ever interact with Mr. Goodwin, who then routes requests to
 * the appropriate specialized servants behind the scenes.
 * 
 * Mr. Goodwin handles:
 * - Request classification and routing
 * - Credit management (invisible to user)
 * - Context management via vector stores
 * - Presenting unified responses back to the user
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import OpenAI from 'openai';
import { mcpService, MCP_COSTS } from './mcpService';
import { creditService } from './creditService';
import { mechanicService } from './mechanicService';
// Import other servant services as they're developed

// Configure OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Types for Goodwin requests
export interface GoodwinRequest {
  query: string;
  imageUrls?: string[];
  userId: string;
  sessionId: string;
}

export interface GoodwinResponse {
  response: string;
  credits: number;
  lowCredits: boolean;
  lowCreditMessage?: string;
}

// Servant types for intent classification
export enum ServantType {
  GOODWIN_DIRECT = 'goodwin_direct',
  BRIGHTWELL = 'brightwell', // Artist
  GEARHART = 'gearhart',     // Mechanic
  SCRIVNER = 'scrivner',     // Scribe
  PRIMROSE = 'primrose',     // Gardener
  SETTER = 'setter',         // Valet
  BELLAMY = 'bellamy',       // Chambermaid
  TUCKETT = 'tuckett',       // Footman
  PENNON = 'pennon',         // Archivist
  FEATHERSTONE = 'featherstone', // Housekeeper
}

export class GoodwinService {
  /**
   * Process a user request through Mr. Goodwin
   * This is the main entry point for all user interactions
   */
  async processRequest(request: GoodwinRequest): Promise<GoodwinResponse> {
    try {
      // 1. Calculate base cost for Goodwin's routing service
      const baseCost = MCP_COSTS.GOODWIN.BASE_COST;
      
      // 2. Check if user has enough credits
      const hasEnoughCredits = await creditService.hasEnoughCredits(request.userId, baseCost);
      if (!hasEnoughCredits) {
        throw new Error(`Insufficient credits. Required: ${baseCost}`);
      }
      
      // 3. Classify the user's intent to determine which servant to route to
      const servantType = await this.classifyIntent(request);
      
      // 4. Route the request to the appropriate servant
      let response: string;
      let additionalCost = 0;
      
      switch (servantType) {
        case ServantType.GEARHART:
          // Route to Mr. Gearhart (mechanic)
          const mechanicResponse = await mechanicService.getAssistance(request.userId, {
            query: request.query,
            imageUrls: request.imageUrls,
          });
          response = this.formatServantResponse(ServantType.GEARHART, mechanicResponse.mechanicResponse.response);
          // We've already charged for Mr. Gearhart's service within mechanicService
          break;
          
        case ServantType.BRIGHTWELL:
          // Route to Mr. Brightwell (artist)
          // For now, just a placeholder until properly implemented
          response = "I'll prepare that image for you right away, sir.";
          additionalCost = MCP_COSTS.IMAGE_GENERATION.BASE_COST;
          break;
          
        // Add cases for other servants as they're implemented
          
        case ServantType.GOODWIN_DIRECT:
        default:
          // Handle directly by Goodwin
          response = await this.generateGoodwinResponse(request);
          additionalCost = 0; // Already accounted for in base cost
          break;
      }
      
      // 5. Record Goodwin's orchestration operation and deduct base credits
      await mcpService.recordOperation(request.userId, {
        server: 'GOODWIN',
        operation: 'ORCHESTRATION',
        baseCost,
        metadata: {
          servantType,
          query: request.query,
          sessionId: request.sessionId,
        }
      });
      
      // 6. Check if credits are low after the operation
      const { credits, lowCredits } = await creditService.checkCreditBalance(request.userId);
      
      // 7. Return the formatted response
      return {
        response,
        credits,
        lowCredits,
        lowCreditMessage: lowCredits ? 'I must inform you that your household account is running rather low, sir. Perhaps we should consider a small replenishment when convenient.' : undefined
      };
    } catch (error: any) {
      console.error('Error processing request through Mr. Goodwin:', error);
      if (error.message.includes('Insufficient credits')) {
        return {
          response: "I do apologize, sir/madam, but it appears the household account has insufficient funds at present. Might I suggest a modest replenishment to continue providing our services?",
          credits: 0,
          lowCredits: true,
          lowCreditMessage: "Household account requires immediate attention."
        };
      }
      throw error;
    }
  }
  
  /**
   * Classify the user's intent to determine which servant to route to
   * This uses OpenAI to analyze the query and determine the best servant
   */
  private async classifyIntent(request: GoodwinRequest): Promise<ServantType> {
    try {
      // Build the system prompt for classification
      const systemPrompt = `
You are an intent classifier for Mr. Goodwin, the head butler of a digital household staff.
Your task is to analyze the user's request and determine which specialized servant should handle it.

Available servants:
- Mr. Gearhart (mechanic): Handles questions about equipment, repairs, manuals, parts, troubleshooting
- Mr. Brightwell (artist): Handles image generation, visual design, and artistic requests
- Mr. Scrivner (scribe): Handles document creation, editing, and management
- Ms. Primrose (gardener): Handles plants, gardening, weather, and outdoor questions
- Mr. Setter (valet): Handles personal reminders, scheduling, appointments, and daily routines
- Mr. Goodwin (direct): Handle general questions, conversation, and anything not covered by specialists

Respond with ONLY the servant type that best matches the request. Valid responses:
GOODWIN_DIRECT, BRIGHTWELL, GEARHART, SCRIVNER, PRIMROSE, SETTER
`;

      // Call OpenAI for classification
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.query }
        ],
        temperature: 0.1, // Low temperature for more consistent classifications
        max_tokens: 20,
      });
      
      // Parse the response to get the servant type
      const servantString = response.choices[0].message.content?.trim().toUpperCase() || 'GOODWIN_DIRECT';
      
      // Map the string to the enum
      switch (servantString) {
        case 'GEARHART': return ServantType.GEARHART;
        case 'BRIGHTWELL': return ServantType.BRIGHTWELL;
        case 'SCRIVNER': return ServantType.SCRIVNER;
        case 'PRIMROSE': return ServantType.PRIMROSE;
        case 'SETTER': return ServantType.SETTER;
        case 'GOODWIN_DIRECT':
        default:
          return ServantType.GOODWIN_DIRECT;
      }
    } catch (error) {
      console.error('Error classifying intent:', error);
      // Default to direct Goodwin handling if classification fails
      return ServantType.GOODWIN_DIRECT;
    }
  }
  
  /**
   * Generate a direct response from Mr. Goodwin for queries he can handle himself
   */
  private async generateGoodwinResponse(request: GoodwinRequest): Promise<string> {
    try {
      // Build the system prompt for Goodwin
      const systemPrompt = `
You are Mr. Goodwin, the head butler of a digital household staff in the style of an Edwardian country house.
You are unfailingly polite, proper, and helpful. You address the user formally as "sir" or "madam" as appropriate.
Your tone is dignified and formal but warm. You never mention "AI" or "language models" - you are simply the butler.

If the user's request requires specialized knowledge or services, you can consult with your staff invisibly, 
but you never mention them by name to the user - you present all answers as coming from yourself.

Respond helpfully to the user's query in your role as Mr. Goodwin.
`;

      // Call OpenAI for Goodwin's response
      const response = await openai.chat.completions.create({
        model: "gpt-4.1-nano-2025-04-14",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.query }
        ],
        temperature: 0.7,
        max_tokens: 500,
      });
      
      return response.choices[0].message.content || "I beg your pardon, sir/madam, but I seem to be experiencing a momentary lapse. How else may I be of service?";
    } catch (error) {
      console.error('Error generating Goodwin response:', error);
      return "I do apologize, sir/madam, but I seem to be experiencing some difficulty at present. Perhaps we might try again in a moment?";
    }
  }
  
  /**
   * Format the response from a servant to maintain Goodwin's voice
   */
  private formatServantResponse(servantType: ServantType, rawResponse: string): string {
    // This would be more sophisticated in a full implementation
    // It would rewrite the servant's response to sound like it came directly from Goodwin
    
    // For now, just return the raw response
    return rawResponse;
  }
  
  /**
   * Store user interactions in vector store for context
   * This would be implemented with Ms. Bellamy's service
   */
  private async storeInteraction(request: GoodwinRequest, response: string): Promise<void> {
    // Placeholder for vector store integration
    // In a full implementation, this would store the interaction in the appropriate vector store
    console.log('Storing interaction in vector store (placeholder)');
  }
}

// Goodwin costs are now defined in mcpService.ts

// Singleton instance for use throughout the application
export const goodwinService = new GoodwinService();
