/**
 * Simple test endpoint to check if the app is working
 * without any auth or complex logic that might cause redirects
 */

import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  
  return NextResponse.json({
    message: 'Test endpoint working!',
    timestamp: new Date().toISOString(),
    host: url.host,
    origin: url.origin,
    url: url.href,
    headers: {
      'user-agent': request.headers.get('user-agent'),
      'host': request.headers.get('host'),
      'x-forwarded-host': request.headers.get('x-forwarded-host'),
      'x-forwarded-proto': request.headers.get('x-forwarded-proto'),
    }
  }, { 
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    }
  });
} 