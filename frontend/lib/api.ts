'use client';

import { Playlist } from '@/types';
import { BackendChannel, PageResponse, buildPlaylist } from '@/lib/channel-mapper';

export type { BackendChannel } from '@/lib/channel-mapper';
export { buildPlaylist, mapBackendChannel } from '@/lib/channel-mapper';

export interface BackendFavorite {
  id: number;
  channelId: number;
  createdAt: string;
  channel?: BackendChannel;
}

interface StreamResponse {
  channelId: number;
  streamUrl: string;
  online: boolean;
}

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080').replace(/\/$/, '');

// The backend runs on a free tier that spins down when idle, so the first
// request after a while can hang or return a transient gateway error while the
// instance cold-starts. Retry through those instead of failing immediately.
const ATTEMPT_TIMEOUT_MS = 15_000;
const MAX_TOTAL_RETRY_MS = 90_000;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * fetch() wrapper that tolerates a cold-starting backend: each attempt has its
 * own timeout, and network errors / gateway statuses (502/503/504) are retried
 * with exponential backoff until ~90s elapse. Other 4xx/5xx are returned to the
 * caller as-is (not retried) so genuine errors surface quickly.
 */
export const fetchWithRetry = async (url: string, init?: RequestInit): Promise<Response> => {
  const deadline = Date.now() + MAX_TOTAL_RETRY_MS;
  let attempt = 0;
  let lastError: unknown;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, {
        ...init,
        signal: AbortSignal.timeout(ATTEMPT_TIMEOUT_MS),
      });
      if (!RETRYABLE_STATUSES.has(response.status)) {
        return response;
      }
      lastError = new Error(`Request failed (${response.status}): ${url}`);
    } catch (error) {
      // Network failure or per-attempt timeout (AbortError) — both retryable.
      lastError = error;
    }

    const backoff = Math.min(1_000 * 2 ** attempt, 8_000);
    attempt += 1;
    if (Date.now() + backoff >= deadline) {
      break;
    }
    await sleep(backoff);
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`Request failed after retries: ${url}`);
};

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetchWithRetry(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  });
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${path}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
};

const MAX_CHANNEL_PAGES = 100;

export const fetchAllChannels = async (): Promise<BackendChannel[]> => {
  const size = 200;
  const all: BackendChannel[] = [];

  for (let page = 0; page < MAX_CHANNEL_PAGES; page += 1) {
    const data = await request<PageResponse<BackendChannel>>(`/api/channels?page=${page}&size=${size}`);
    all.push(...data.content);
    if (data.last || data.content.length === 0) {
      break;
    }
  }

  return all;
};

export const fetchUzbekPlaylist = async (): Promise<Playlist> => {
  const channels = await fetchAllChannels();
  return buildPlaylist(channels);
};

export const searchChannels = async (query: string): Promise<BackendChannel[]> => {
  const data = await request<PageResponse<BackendChannel>>(
    `/api/channels/search?q=${encodeURIComponent(query)}&size=200`
  );
  return data.content;
};

export const fetchCategories = (): Promise<string[]> => request<string[]>('/api/channels/categories');

export const fetchStreamUrl = async (channelId: number | string): Promise<string> => {
  const data = await request<StreamResponse>(`/api/channels/${channelId}/stream`);
  return data.streamUrl;
};

export const fetchFavorites = (): Promise<BackendFavorite[]> => request<BackendFavorite[]>('/api/favorites');

export const addFavorite = (channelId: number | string): Promise<BackendFavorite> =>
  request<BackendFavorite>(`/api/favorites/${channelId}`, { method: 'POST' });

export const removeFavorite = (channelId: number | string): Promise<void> =>
  request<void>(`/api/favorites/${channelId}`, { method: 'DELETE' });

export const triggerImport = (): Promise<unknown> =>
  request<unknown>('/api/import/uzbek-channels', { method: 'POST' });
