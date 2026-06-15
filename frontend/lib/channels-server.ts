import { Playlist } from '@/types';
import { BackendChannel, PageResponse, buildPlaylist } from '@/lib/channel-mapper';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

// Refresh the cached channel list at most this often. The browser never waits
// on the backend for the first paint — Next serves the cached payload from the
// CDN and revalidates in the background.
const REVALIDATE_SECONDS = 300;
const PAGE_SIZE = 200;
const MAX_PAGES = 100;
// Keep the server render fast even when the backend is cold: bail out instead of
// hanging on a spun-down instance, and let the client hydrate/fetch as a fallback.
const FETCH_TIMEOUT_MS = 6000;

/**
 * Fetches the full Uzbek channel list on the server with ISR caching.
 * Returns an empty playlist (never throws) so a cold or unreachable backend
 * degrades to the client-side fallback fetch instead of failing the render.
 */
export async function getInitialPlaylist(): Promise<Playlist> {
  const all: BackendChannel[] = [];

  try {
    for (let page = 0; page < MAX_PAGES; page += 1) {
      const response = await fetch(`${API_URL}/api/channels?page=${page}&size=${PAGE_SIZE}`, {
        headers: { 'Content-Type': 'application/json' },
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
        next: { revalidate: REVALIDATE_SECONDS },
      });

      if (!response.ok) {
        break;
      }

      const data = (await response.json()) as PageResponse<BackendChannel>;
      all.push(...data.content);
      if (data.last || data.content.length === 0) {
        break;
      }
    }
  } catch (error) {
    console.error('[channels-server] Failed to prefetch channels:', error);
    return { channels: [], groups: [] };
  }

  return buildPlaylist(all);
}
