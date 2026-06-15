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

const request = async <T>(path: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
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
  let page = 0;
  const all: BackendChannel[] = [];

  while (true) {
    const data = await request<PageResponse<BackendChannel>>(`/api/channels?page=${page}&size=${size}`);
    all.push(...data.content);
    if (data.last || data.content.length === 0) {
      break;
    }
    page += 1;
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
