import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const urlParams = request.nextUrl.searchParams;
  const targetUrl = urlParams.get('url');

  if (!targetUrl) {
    return new NextResponse('Missing URL parameter', { status: 400 });
  }

  try {
    new URL(targetUrl);
  } catch {
    return new NextResponse('Invalid URL', { status: 400 });
  }

  console.log(`[Proxy] Fetching: ${targetUrl}`);

  try {
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'VLC/3.0.20 LibVLC/3.0.20',
      },
    });

    if (!response.ok) {
       console.error(`[Proxy] Upstream error: ${response.status} ${response.statusText}`);
       return new NextResponse(`Upstream error: ${response.status}`, { status: response.status });
    }

    const contentType = response.headers.get('Content-Type') || '';
    
    const isM3u8 = targetUrl.toLowerCase().includes('.m3u8') || 
                   contentType.includes('application/vnd.apple.mpegurl') ||
                   contentType.includes('application/x-mpegurl');

    if (isM3u8) {
        console.log('[Proxy] Detected M3U8 playlist. Rewriting...');
        const text = await response.text();
        const baseUrl = new URL(targetUrl);
        
        const rewritten = text.split('\n').map(line => {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) {
                return line;
            }

            try {
                const absoluteUrl = new URL(trimmed, baseUrl).toString();
                return `${request.nextUrl.origin}/api/proxy?url=${encodeURIComponent(absoluteUrl)}`;
            } catch (e) {
                console.warn(`[Proxy] Failed to rewrite line: ${trimmed}`, e);
                return line;
            }
        }).join('\n');

        return new NextResponse(rewritten, {
            headers: {
                'Content-Type': 'application/vnd.apple.mpegurl',
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-cache, no-store, must-revalidate',
            }
        });
    }

    return new NextResponse(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=3600',
        }
    });

  } catch (error) {
    console.error('[Proxy] Error:', error);
    const message = error instanceof Error ? error.message : 'Proxy Error';
    return new NextResponse(message, { status: 500 });
  }
}
