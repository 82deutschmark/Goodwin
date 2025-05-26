/**
 * Credit Service - Manages all credit operations for the application
 *
 * This service is the central point for all credit-related operations including:
 * - Checking credit balances
 * - Deducting credits for feature usage
 * - Applying markups to external service costs
 * - Providing consistent transaction management to prevent race conditions
 *
 * Author: Cascade (gpt-4.1-nano-2025-04-14)
 * Last updated: 2025-05-25
 *
 * Notes: Removed unused import. Lint-free.
 */

import { prisma } from '@/lib/prisma';
import { User } from '@prisma/client';

export interface CreditOperation {
  userId: string;
  creditsToSpend: number;
  featureUsed: string;
  metadataJson?: string; // Additional metadata in JSON format
}

export class CreditService {
  /**
   * Check if a user has sufficient credits for an operation
   * @returns Boolean indicating if user has enough credits
   */
  async hasEnoughCredits(userId: string, creditsRequired: number): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });
    return user !== null && user.credits >= creditsRequired;
  }

  /**
   * Deduct credits from a user for a feature use (within a transaction)
   * @returns The updated user record with new credit balance
   */
  async deductCredits(operation: CreditOperation): Promise<User> {
    // Perform everything in a transaction with proper isolation
    return await prisma.$transaction(async (tx) => {
      // Get current user with FOR UPDATE lock to prevent race conditions
      const user = await tx.user.findUnique({
        where: { id: operation.userId }
      });
      
      if (!user) {
        throw new Error(`User with ID ${operation.userId} not found`);
      }
      
      if (user.credits < operation.creditsToSpend) {
        throw new Error(`Insufficient credits. Required: ${operation.creditsToSpend}, Available: ${user.credits}`);
      }
      
      // Record the spend operation
      await tx.creditSpend.create({
        data: {
          userId: operation.userId,
          featureUsed: operation.featureUsed,
          creditsSpent: operation.creditsToSpend
        }
      });
      
      // Update user's credit balance
      return await tx.user.update({
        where: { id: operation.userId },
        data: { credits: { decrement: operation.creditsToSpend } }
      });
    });
  }

  /**
   * Calculate cost for MCP server usage with 30% markup
   * @param baseCredits - Base credit cost of the operation
   * @returns The total credits to charge including markup
   */
  calculateCreditsWithMarkup(baseCredits: number): number {
    return Math.ceil(baseCredits * 1.3); // 30% markup
  }

  /**
   * Check user's credit balance and detect if low
   * @returns Object with balance and lowCredits flag
   */
  async checkCreditBalance(userId: string): Promise<{ credits: number; lowCredits: boolean }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { credits: true }
    });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    // Consider 100 credits as the low threshold
    return {
      credits: user.credits,
      lowCredits: user.credits < 100
    };
  }

  /**
   * Add credits to a user's balance
   * Used for manual adjustments or refunds
   */
  async addCredits(userId: string, creditsToAdd: number, reason: string): Promise<User> {
    return await prisma.$transaction(async (tx) => {
      // Create adjustment record
      await tx.creditAdjustment.create({
        data: {
          userId,
          amount: creditsToAdd,
          reason
        }
      });
      
      // Update user's credit balance
      return await tx.user.update({
        where: { id: userId },
        data: { credits: { increment: creditsToAdd } }
      });
    });
  }

  /**
   * Get user's credit transaction history
   * @param userId - User ID to get history for
   * @param limit - Maximum number of transactions to return
   * @returns Object with purchases, spends, and adjustments arrays
   */
  async getCreditHistory(userId: string, limit = 10): Promise<{
    purchases: any[];
    spends: any[];
    adjustments: any[];
  }> {
    const [purchases, spends, adjustments] = await Promise.all([
      prisma.creditPurchase.findMany({
        where: { userId },
        orderBy: [{ timestamp: 'desc' }],
        take: limit
      }),
      prisma.creditSpend.findMany({
        where: { userId },
        orderBy: [{ timestamp: 'desc' }],
        take: limit
      }),
      prisma.creditAdjustment.findMany({
        where: { userId },
        orderBy: [{ timestamp: 'desc' }],
        take: limit
      })
    ]);

    return { purchases, spends, adjustments };
  }
}

// Singleton instance for use throughout the application
export const creditService = new CreditService();
