'use client';

import { createContext, useContext, ReactNode } from 'react';
import usePlaylistLoader from '@/hooks/usePlaylistLoader';
import { useAppContext } from './AppContext';
import { usePlayerStore } from '@/store/useStore';
import { PageView } from '@/types';
import { PredefinedPlaylist } from '@/types/playlist';

interface LoginContextType {
  input: string;
  setInput: (value: string) => void;
  epgInput: string;
  setEpgInput: (value: string) => void;
  isLoading: boolean;
  error: string | null;
  handleLoad: () => Promise<void>;
  loadPredefinedPlaylist: (playlist: PredefinedPlaylist) => Promise<void>;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const useLoginContext = () => {
  const context = useContext(LoginContext);
  if (!context) {
    throw new Error('useLoginContext must be used within LoginProvider');
  }
  return context;
};

interface LoginProviderProps {
  children: ReactNode;
}

export const LoginProvider = ({ children }: LoginProviderProps) => {
  const playlistLoader = usePlaylistLoader();
  const { setCurrentView } = useAppContext();
  const { playlist } = usePlayerStore();

  const handlePlaylistLoaded = async () => {
    await playlistLoader.handleLoad();
    if (playlist.length > 0) {
      setCurrentView(PageView.BROWSE);
    }
  };

  const handlePredefinedPlaylistLoaded = async (selectedPlaylist: PredefinedPlaylist) => {
    await playlistLoader.loadPredefinedPlaylist(selectedPlaylist);
    if (playlist.length > 0) {
      setCurrentView(PageView.BROWSE);
    }
  };

  const value: LoginContextType = {
    ...playlistLoader,
    handleLoad: handlePlaylistLoaded,
    loadPredefinedPlaylist: handlePredefinedPlaylistLoaded,
  };

  return <LoginContext.Provider value={value}>{children}</LoginContext.Provider>;
};

