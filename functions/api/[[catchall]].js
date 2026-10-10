/**
 * Cloudflare Pages Function: API Reverse Proxy
 * Intercepts all requests to /api/* on Cloudflare Pages and proxies them
 * to the configured backend server (e.g. Render, Railway, Fly.io, VPS, or tunnel).
 *
 * Configurable via Cloudflare Pages Environment Variables:
 * - BACKEND_API_URL: e.g. "https://api.shashanktravels.com" or "https://your-backend.railway.app"
 * - VITE_API_URL: fallback backend URL
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // 1. Handle CORS Preflight OPTIONS at the edge
  if (request.method.toUpperCase() === 'OPTIONS') {
    const origin = request.headers.get('Origin') || '*';
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // 2. Determine upstream backend base URL
  const backendBase = env.BACKEND_API_URL || env.VITE_API_URL;

  if (!backendBase) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Backend API URL is not configured on Cloudflare Pages.',
        hint: 'Set BACKEND_API_URL in Cloudflare Pages dashboard -> Settings -> Environment Variables.',
        path: url.pathname,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }

  // 3. Parse backend base URL and prevent infinite proxy loops
  let targetParsed;
  try {
    targetParsed = new URL(backendBase);
  } catch (urlErr) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Invalid BACKEND_API_URL environment variable configured on Cloudflare Pages.',
        details: urlErr.message,
      }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (targetParsed.host === url.host) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Infinite proxy loop detected: BACKEND_API_URL cannot point to the Cloudflare Pages domain itself.',
      }),
      {
        status: 508,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // 4. Build target URL preserving pathname and query parameters without duplicating /api
  const basePath = targetParsed.pathname.replace(/\/+$/, '');
  let requestPath = url.pathname;
  if (basePath.endsWith('/api') && requestPath.startsWith('/api/')) {
    requestPath = requestPath.slice(4);
  }
  const targetUrl = new URL(basePath + requestPath + url.search, targetParsed.origin);

  // 5. Prepare forwarding headers
  const forwardHeaders = new Headers(request.headers);
  forwardHeaders.delete('host'); // Let fetch set host header to target domain
  forwardHeaders.set('X-Forwarded-Host', url.host);
  forwardHeaders.set('X-Forwarded-Proto', url.protocol.replace(':', ''));
  forwardHeaders.set('X-Real-IP', request.headers.get('cf-connecting-ip') || '');

  const fetchInit = {
    method: request.method,
    headers: forwardHeaders,
    redirect: 'manual',
  };

  // Attach body for mutation requests
  if (!['GET', 'HEAD'].includes(request.method.toUpperCase())) {
    fetchInit.body = request.body;
  }

  try {
    const upstreamResponse = await fetch(targetUrl.toString(), fetchInit);

    // Copy upstream headers
    const responseHeaders = new Headers(upstreamResponse.headers);
    responseHeaders.set('X-Proxied-By', 'Cloudflare-Pages-Function');

    return new Response(upstreamResponse.body, {
      status: upstreamResponse.status,
      statusText: upstreamResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err) {
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to communicate with upstream backend server.',
        details: err.message,
      }),
      {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store',
        },
      }
    );
  }
}
