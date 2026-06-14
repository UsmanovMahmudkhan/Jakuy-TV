'use client';

import { IptvOrgPlaylist, IptvOrgPlaylistGroup, fetchIptvOrgPlaylists, searchPlaylists } from '@/lib/iptv-org-playlists';
import { useCallback, useEffect, useState } from 'react';

interface UseIptvOrgPlaylistsReturn {
  groups: IptvOrgPlaylistGroup[];
  filteredPlaylists: IptvOrgPlaylist[];
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedType: IptvOrgPlaylist['type'] | null;
  setSelectedType: (type: IptvOrgPlaylist['type'] | null) => void;
  refresh: () => Promise<void>;
}

export const useIptvOrgPlaylists = (): UseIptvOrgPlaylistsReturn => {
  const [groups, setGroups] = useState<IptvOrgPlaylistGroup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<IptvOrgPlaylist['type'] | null>(null);

  const loadPlaylists = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const fetchedGroups = await fetchIptvOrgPlaylists();
      setGroups(fetchedGroups);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlists');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlaylists();
  }, [loadPlaylists]);

  const filteredPlaylists = searchPlaylists(groups, searchQuery, selectedType || undefined);

  const refresh = useCallback(async () => {
    await loadPlaylists();
  }, [loadPlaylists]);

  return {
    groups,
    filteredPlaylists,
    isLoading,
    error,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    refresh,
  };
};