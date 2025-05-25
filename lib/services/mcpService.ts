/**
 * MCP Server Integration Service
 * 
 * This service handles integration with MCP servers, tracking usage costs,
 * and applying the required markup. It works with the Credit Service to
 * ensure proper accounting for all MCP operations.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import { creditService } from './creditService';

// Define cost constants for different MCP servers and operations
export const MCP_COSTS = {
  // Base costs that will have markup applied
  GITHUB: {
    CREATE_REPO: 5,
    FORK_REPO: 3,
    LIST_REPOS: 1,
    // Add other GitHub operations as needed
  },
  STRIPE: {
    CREATE_CUSTOMER: 2,
    CREATE_PAYMENT: 3,
    // Add other Stripe operations as needed
  },
  PUPPETEER: {
    NAVIGATE: 2,
    SCREENSHOT: 5,
    // Add other Puppeteer operations as needed
  },
  SEQUENTIAL_THINKING: {
    BASE_COST: 8,
    // Add other Sequential Thinking operations as needed
  },
  IMAGE_GENERATION: {
    BASE_COST: 30,
    HIGH_RESOLUTION: 50,
    // Add other image generation options as needed
  },
  MECHANIC_ASSISTANT: {
    BASE_COST: 25,
    IMAGE_ANALYSIS: 15,
    VECTOR_STORE_CREATION: 50,
    VECTOR_STORE_SEARCH: 10,
    // Add other mechanic assistant operations as needed
  },
  GOODWIN: {
    BASE_COST: 5,
    ORCHESTRATION: 2,
  },
  // Add other MCP servers as needed
};

// Interface for tracking MCP server operations
export interface McpOperation {
  server: string;
  operation: string;
  baseCost?: number; // If not provided, will use the predefined cost from MCP_COSTS
  metadata?: Record<string, any>;
}

export class McpService {
  /**
   * Calculate the cost of an MCP operation
   */
  calculateOperationCost(operation: McpOperation): number {
    // Get the base cost, either from the operation or from predefined costs
    let baseCost = operation.baseCost;
    
    if (!baseCost) {
      // Try to find the cost in the predefined costs
      const serverCosts = MCP_COSTS[operation.server as keyof typeof MCP_COSTS];
      if (serverCosts) {
        baseCost = serverCosts[operation.operation as keyof typeof serverCosts];
      }
    }
    
    // Default to a minimum cost if not found
    baseCost = baseCost || 1;
    
    // Apply markup using the credit service
    return creditService.calculateCreditsWithMarkup(baseCost);
  }

  /**
   * Record an MCP operation and deduct credits
   * This should be called after the operation is successfully completed
   */
  async recordOperation(userId: string, operation: McpOperation): Promise<void> {
    const totalCost = this.calculateOperationCost(operation);
    
    // Create metadata JSON
    const metadataJson = JSON.stringify({
      server: operation.server,
      operation: operation.operation,
      baseCost: operation.baseCost,
      ...operation.metadata
    });
    
    // Deduct credits using the credit service
    await creditService.deductCredits({
      userId,
      creditsToSpend: totalCost,
      featureUsed: `mcp:${operation.server}:${operation.operation}`,
      metadataJson
    });
  }
}

// Singleton instance for use throughout the application
export const mcpService = new McpService();
