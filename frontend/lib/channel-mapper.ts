import { Channel, Playlist } from '@/types';

export interface BackendChannel {
  id: number;
  tvgId?: string;
  name: string;
  country?: string;
  countryCode?: string;
  language?: string;
  category?: string;
  logoUrl?: string;
  streamUrl: string;
  online: boolean;
  lastCheckedAt?: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export const mapBackendChannel = (channel: BackendChannel): Channel => ({
  id: String(channel.id),
  tvgId: channel.tvgId,
  tvgName: channel.name,
  groupTitle: channel.category || 'Uncategorized',
  logo: channel.logoUrl,
  name: channel.name,
  url: channel.streamUrl,
  online: channel.online,
});

export const buildPlaylist = (channels: BackendChannel[]): Playlist => {
  const mapped = channels.map(mapBackendChannel);
  const groups = Array.from(
    new Set(mapped.map(channel => channel.groupTitle).filter((group): group is string => Boolean(group)))
  ).sort();
  return { channels: mapped, groups };
};
