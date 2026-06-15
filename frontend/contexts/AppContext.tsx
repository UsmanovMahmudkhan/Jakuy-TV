'use client';

import { createContext, useContext, useEffect, useRef, useState, ReactNode } from 'react';
import { usePlayerStore } from '@/store/useStore';
import { ContinueWatchingChannels, Tab, PageView, Playlist } from '@/types';
import { addFavorite, fetchFavorites, fetchUzbekPlaylist, removeFavorite } from '@/lib/api';

interface AppContextType {
  // View state
  currentView: PageView;
  setCurrentView: (view: PageView) => void;

  // Tab state
  activeTab: Tab;
  previousTab: Tab;
  handleTabChange: (newTab: Tab) => void;
  getSlideDirection: (fromTab: Tab, toTab: Tab) => number;

  // Fullscreen state
  isReturningFromFullscreen: boolean;

  // Continue watching
  getContinueWatchingChannels: () => ContinueWatchingChannels;

  // Loading state
  isLoadingPlaylist: boolean;
  setIsLoadingPlaylist: (loading: boolean) => void;
  loadError: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

interface AppProviderProps {
  children: ReactNode;
  // Channels prefetched on the server (ISR-cached) so the first paint never
  // waits on a live backend round-trip. Empty when the backend was unreachable
  // during render — the client fetch below then takes over as a fallback.
  initialPlaylist?: Playlist;
}

export const AppProvider = ({ children, initialPlaylist }: AppProviderProps) => {
  const { playlist, favorites, activeChannel, setPlaylist, toggleFavorite, isHydrated } = usePlayerStore();

  const isLoadingRef = useRef(false);
  const seededRef = useRef(false);
  const favoritesSeededRef = useRef(false);
  const syncedFavoritesRef = useRef<Set<string> | null>(null);

  const [currentView, setCurrentView] = useState<PageView>(PageView.LOADING);
  const [activeTab, setActiveTab] = useState<Tab>(Tab.FOR_YOU);
  const [previousTab, setPreviousTab] = useState<Tab>(Tab.FOR_YOU);
  const [isLoadingPlaylist, setIsLoadingPlaylist] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Seed the store from the server-prefetched playlist on mount. This runs
  // before the client ever calls the backend, so the browse screen is usable as
  // soon as the JS hydrates — independent of backend warmth. (playlist is not
  // persisted, so store rehydration never clobbers this.)
  useEffect(() => {
    if (seededRef.current) return;
    seededRef.current = true;
    if (
      initialPlaylist &&
      initialPlaylist.channels.length > 0 &&
      usePlayerStore.getState().playlist.length === 0
    ) {
      setPlaylist(initialPlaylist);
      setCurrentView(PageView.BROWSE);
      setIsLoadingPlaylist(false);
    }
  }, [initialPlaylist, setPlaylist]);

  // Load Uzbek channels from the Jakuy TV backend. Acts as a fallback when the
  // server prefetch came back empty, and re-runs after logout (playlist cleared).
  useEffect(() => {
    if (!isHydrated || playlist.length > 0 || isLoadingRef.current) {
      if (playlist.length > 0 && currentView !== PageView.BROWSE) {
        setCurrentView(PageView.BROWSE);
        setIsLoadingPlaylist(false);
      }
      return;
    }

    isLoadingRef.current = true;
    setIsLoadingPlaylist(true);
    setLoadError(null);

    const load = async () => {
      try {
        const parsed = await fetchUzbekPlaylist();
        if (parsed.channels.length === 0) {
          setLoadError('No Uzbek channels available yet. Run the import on the backend.');
        } else {
          setPlaylist(parsed);
          setCurrentView(PageView.BROWSE);
        }
      } catch (err) {
        console.error('Failed to load channels from backend:', err);
        setLoadError('Unable to reach the Jakuy TV backend. Make sure it is running.');
      } finally {
        setIsLoadingPlaylist(false);
        isLoadingRef.current = false;
      }
    };

    load();
  }, [isHydrated, playlist.length, setPlaylist, currentView]);

  // Seed local favorites from the backend once channels are loaded.
  useEffect(() => {
    if (playlist.length === 0 || favoritesSeededRef.current) return;
    favoritesSeededRef.current = true;

    const seed = async () => {
      try {
        const backendFavorites = await fetchFavorites();
        const idToName = new Map(playlist.map(channel => [channel.id, channel.name]));
        const current = new Set(usePlayerStore.getState().favorites);

        backendFavorites.forEach(favorite => {
          const name = idToName.get(String(favorite.channelId));
          if (name && !current.has(name)) {
            toggleFavorite(name);
          }
        });

        syncedFavoritesRef.current = new Set(usePlayerStore.getState().favorites);
      } catch (err) {
        console.error('Failed to load favorites from backend:', err);
        syncedFavoritesRef.current = new Set(usePlayerStore.getState().favorites);
      }
    };

    seed();
  }, [playlist, toggleFavorite]);

  // Push local favorite changes to the backend.
  useEffect(() => {
    if (syncedFavoritesRef.current === null || playlist.length === 0) return;

    const previous = syncedFavoritesRef.current;
    const next = new Set(favorites);
    const nameToId = new Map(playlist.map(channel => [channel.name, channel.id]));

    const added = [...next].filter(name => !previous.has(name));
    const removed = [...previous].filter(name => !next.has(name));

    added.forEach(name => {
      const id = nameToId.get(name);
      if (id) addFavorite(id).catch(err => console.error('Failed to add favorite:', err));
    });
    removed.forEach(name => {
      const id = nameToId.get(name);
      if (id) removeFavorite(id).catch(err => console.error('Failed to remove favorite:', err));
    });

    syncedFavoritesRef.current = next;
  }, [favorites, playlist]);

  const isReturningFromFullscreen = activeChannel !== null;

  const tabOrder: Tab[] = [Tab.FOR_YOU, Tab.ALL, Tab.FAVORITES];

  const handleTabChange = (newTab: Tab) => {
    setPreviousTab(activeTab);
    setActiveTab(newTab);
  };

  const getSlideDirection = (fromTab: Tab, toTab: Tab): number => {
    const fromIndex = tabOrder.indexOf(fromTab);
    const toIndex = tabOrder.indexOf(toTab);
    return fromIndex < toIndex ? -1 : 1;
  };

  const getContinueWatchingChannels = () => {
    const { recentlyWatched } = usePlayerStore.getState();

    if (recentlyWatched.length > 0) {
      const watchedChannels = recentlyWatched
        .map(name => playlist.find(channel => channel.name === name))
        .filter(channel => channel !== undefined);

      if (watchedChannels.length > 0) {
        return { channels: watchedChannels, isContinueWatching: true };
      }
    }

    return { channels: playlist.slice(0, 20), isContinueWatching: false };
  };

  const value: AppContextType = {
    currentView,
    setCurrentView,
    activeTab,
    previousTab,
    handleTabChange,
    getSlideDirection,
    isReturningFromFullscreen,
    getContinueWatchingChannels,
    isLoadingPlaylist,
    setIsLoadingPlaylist,
    loadError,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
