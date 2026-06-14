'use client';

import { createContext, useContext, ReactNode } from 'react';
import { usePlayerStore } from '@/store/useStore';
import { useAppContext } from './AppContext';
import { Channel } from '@/types';
import { ContinueWatchingChannels, Tab } from '@/types';

interface BrowseContextType {
  playlist: Channel[];
  favorites: string[];
  groups: string[];
  activeChannel: Channel | null;
  setActiveChannel: (channel: Channel | null) => void;
  hasFavorites: () => boolean;
  activeTab: Tab;
  previousTab: Tab;
  getSlideDirection: (fromTab: Tab, toTab: Tab) => number;
  isReturningFromFullscreen: boolean;
  getContinueWatchingChannels: () => ContinueWatchingChannels;
  isLoadingPlaylist: boolean;
}

const BrowseContext = createContext<BrowseContextType | undefined>(undefined);

export const useBrowseContext = () => {
  const context = useContext(BrowseContext);
  if (!context) {
    throw new Error('useBrowseContext must be used within BrowseProvider');
  }
  return context;
};

interface BrowseProviderProps {
  children: ReactNode;
}

export const BrowseProvider = ({ children }: BrowseProviderProps) => {
  const { playlist, favorites, groups, activeChannel, setActiveChannel, hasFavorites } = usePlayerStore();
  const { activeTab, previousTab, getSlideDirection, isReturningFromFullscreen, getContinueWatchingChannels, isLoadingPlaylist } = useAppContext();

  const value: BrowseContextType = {
    playlist,
    favorites,
    groups,
    activeChannel,
    setActiveChannel,
    hasFavorites,
    activeTab,
    previousTab,
    getSlideDirection,
    isReturningFromFullscreen,
    getContinueWatchingChannels,
    isLoadingPlaylist,
  };

  return <BrowseContext.Provider value={value}>{children}</BrowseContext.Provider>;
};

