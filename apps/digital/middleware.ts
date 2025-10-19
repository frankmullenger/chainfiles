/**
 * Next.js Middleware - Routes requests to appropriate payment middleware
 */

import { NextRequest, NextResponse } from 'next/server';

import { middleware as dynamicMiddleware } from './middleware/dynamicMiddleware';
// Import our specialized middleware implementations
import { middleware as staticMiddleware } from './middleware/staticMiddleware';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Route to static middleware for /api/download/static/* paths
  if (pathname.startsWith('/api/download/static/')) {
    console.log('🔀 Routing to STATIC middleware for:', pathname);
    return await staticMiddleware(request);
  }

  // Route to dynamic middleware for /api/download/dynamic/* paths
  if (pathname.startsWith('/api/download/dynamic/')) {
    console.log('🔀 Routing to DYNAMIC middleware for:', pathname);
    return await dynamicMiddleware(request);
  }

  // Let other requests pass through
  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ['/api/download/static/:path*', '/api/download/dynamic/:path*']
};
