/**
 * MCP Credit Manager
 * 
 * This utility provides standardized functions for handling credit operations
 * across different MCP servers. It abstracts away the complexity of credit
 * management while ensuring consistent tracking and error handling.
 * 
 * Author: Cascade (Claude 3.5 Sonnet)
 * Date: 2025-05-25
 */

import { getServerSession } from 'next-auth/next';
import { creditService } from './creditService';
import { mcpService, McpOperation } from './mcpService';

export class McpCreditManager {
  /**
   * Execute an MCP operation with proper credit handling
   * 
   * @param operation - The MCP operation details
   * @param executeFunc - The function to execute the actual operation
   * @returns The result of the operation
   * 
   * This function:
   * 1. Authenticates the user
   * 2. Checks credit balance
   * 3. Calculates the cost with markup
   * 4. Executes the operation
   * 5. Records the credit spend
   * 6. Returns the result with credit information
   */
  static async executeWithCredits<T>(
    operation: McpOperation,
    executeFunc: () => Promise<T>
  ): Promise<{ 
    result: T; 
    credits: number; 
    lowCredits: boolean;
  }> {
    // 1. Get user from session
    const session = await getServerSession();
    if (!session?.user?.id) {
      throw new Error('Unauthorized: User must be logged in');
    }
    
    const userId = session.user.id;
    
    // 2. Calculate cost with markup
    const totalCost = mcpService.calculateOperationCost(operation);
    
    // 3. Check if user has enough credits
    const hasEnoughCredits = await creditService.hasEnoughCredits(userId, totalCost);
    if (!hasEnoughCredits) {
      throw new Error(`Insufficient credits. Required: ${totalCost}`);
    }
    
    try {
      // 4. Execute the operation
      const result = await executeFunc();
      
      // 5. Record the operation and deduct credits
      await mcpService.recordOperation(userId, operation);
      
      // 6. Check if credits are low after operation
      const { credits, lowCredits } = await creditService.checkCreditBalance(userId);
      
      // 7. Return the result with credit information
      return {
        result,
        credits,
        lowCredits
      };
    } catch (error) {
      console.error(`Error executing MCP operation ${operation.server}:${operation.operation}:`, error);
      throw error;
    }
  }
  
  /**
   * Handle MCP operation errors with proper credit-related responses
   */
  static handleMcpError(error: any): { 
    error: string; 
    status: number;
    insufficientCredits?: boolean;
  } {
    if (error.message?.includes('Unauthorized')) {
      return { error: 'You must be logged in to use this feature', status: 401 };
    } else if (error.message?.includes('Insufficient credits')) {
      return { 
        error: 'Insufficient credits. Please purchase more credits to continue.',
        status: 402, // Payment Required
        insufficientCredits: true
      };
    } else {
      console.error('MCP operation error:', error);
      return { 
        error: 'An error occurred while processing your request',
        status: 500
      };
    }
  }
}
