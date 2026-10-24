import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js API Route Proxy for Vercel Multi-Service Architecture.
 * When the Express backend service is internal, this handler receives client requests
 * and forwards them to the private service using the Vercel-injected BACKEND_URL binding.
 */
function getTargetBackendUrl(request: NextRequest, pathSegments: string[]): URL {
  // 1. Check for Vercel Service Binding (injected at runtime in serverless functions)
  const base = process.env['BACKEND_URL'] || process.env['INTERNAL_BACKEND_URL'] || 'http://localhost:3000';
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;

  // 2. Reconstruct path and query parameters
  const path = `/api/${pathSegments.join('/')}`;
  const search = request.nextUrl.search;

  return new URL(`${path}${search}`, cleanBase);
}

async function forwardToBackend(request: NextRequest, pathSegments: string[]) {
  const targetUrl = getTargetBackendUrl(request, pathSegments);

  try {
    const headers = new Headers(request.headers);
    // Remove host header to avoid SNI/host mismatches in private service routing
    headers.delete('host');

    const body = ['GET', 'HEAD'].includes(request.method)
      ? undefined
      : await request.blob();

    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      // @ts-expect-error duplex required for streaming in Node 18+
      duplex: 'half',
      cache: 'no-store',
    });

    const responseHeaders = new Headers(response.headers);
    responseHeaders.delete('content-encoding');

    return new NextResponse(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`[Vercel Service Proxy] Failed to reach backend at ${targetUrl.toString()}:`, message);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'BACKEND_SERVICE_UNAVAILABLE',
          message: 'Unable to communicate with the internal EventAI backend service.',
          details: message,
        },
        timestamp: new Date().toISOString(),
      },
      { status: 502 }
    );
  }
}

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardToBackend(request, params.path);
}

export async function POST(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardToBackend(request, params.path);
}

export async function PUT(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardToBackend(request, params.path);
}

export async function PATCH(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardToBackend(request, params.path);
}

export async function DELETE(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardToBackend(request, params.path);
}

export async function OPTIONS(request: NextRequest, { params }: { params: { path: string[] } }) {
  return forwardToBackend(request, params.path);
}
