/**
 * Create Vector Store API Endpoint for Mechanic Assistant
 * 
 * This endpoint handles the creation of vector stores for equipment manuals
 * and technical documentation. It enables Mr. Gearhart to access model-specific
 * information when answering questions.
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
    const formData = await req.formData();
    
    // 2. Validate request data
    const name = formData.get('name') as string;
    if (!name) {
      return NextResponse.json({ error: 'Vector store name is required' }, { status: 400 });
    }
    
    const files = formData.getAll('files') as File[];
    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'At least one file is required' }, { status: 400 });
    }
    
    // 3. Create vector store and handle credit deduction
    try {
      const vectorStoreId = await mechanicService.createEquipmentVectorStore(userId, name, files);
      
      // 4. Return the vector store ID
      return NextResponse.json({
        vectorStoreId,
        message: `Vector store "${name}" created successfully`,
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
    console.error('Error creating vector store:', error);
    return NextResponse.json(
      { error: 'An error occurred while creating the vector store.' }, 
      { status: 500 }
    );
  }
}
