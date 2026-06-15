"use server";

import { assertPublicHttpUrl, UrlGuardError } from "@/lib/url-guard";

const FETCH_TIMEOUT_MS = 20000;

type FetchResult =
  | { success: true; data: string }
  | { success: false; error: string };

async function fetchText(url: string, label: string): Promise<FetchResult> {
  try {
    const safeUrl = await assertPublicHttpUrl(url);

    const response = await fetch(safeUrl.toString(), {
      method: "GET",
      headers: {
        "User-Agent": "VLC/3.0.20 LibVLC/3.0.20",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.text();
    return { success: true, data };
  } catch (error) {
    if (error instanceof UrlGuardError) {
      return { success: false, error: error.message };
    }
    if (error instanceof DOMException && error.name === "TimeoutError") {
      console.error(`${label} fetch timed out:`, url);
      return { success: false, error: `${label} fetch failed: request timed out` };
    }
    if (error instanceof Error) {
      console.error(`${label} fetch error:`, error.message);
      return { success: false, error: `${label} fetch failed: ${error.message}` };
    }

    console.error(`${label} fetch error (unknown):`, error);
    return { success: false, error: `${label} fetch failed: Unknown error` };
  }
}

export async function fetchPlaylist(url: string) {
  return fetchText(url, "Playlist");
}

export async function fetchEpg(url: string) {
  return fetchText(url, "EPG");
}
