'use client';

import { createContext, useContext, ReactNode } from 'react';
import { Channel } from '@/types';
import { useFullScreenPlayer } from '@/hooks/useFullScreenPlayer';

interface FullScreenPlayerContextType {
  // Stream
  videoRef: React.RefObject<HTMLVideoElement | null>;
  audioRef: React.RefObject<HTMLAudioElement | null>;
  error: string | null;
  isAudioOnly: boolean;
  isLive: boolean;
  duration: number | null;

  // State
  isPlaying: boolean;
  isMuted: boolean;
  volume: number;
  currentTime: number;
  showControls: boolean;
  showChannelList: boolean;
  isFullscreen: boolean;
  isFavorite: boolean;

  // Refs
  channelListRef: React.RefObject<HTMLDivElement>;
  currentChannelRef: React.RefObject<HTMLDivElement>;

  // Handlers
  togglePlayPause: (e: React.MouseEvent) => void;
  toggleMute: (e: React.MouseEvent) => void;
  toggleFullscreen: (e: React.MouseEvent) => void;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleToggleControls: () => void;
  handleToggleFavorite: (e: React.MouseEvent) => void;
  handleToggleChannelList: (e: React.MouseEvent) => void;
  handleCloseChannelList: () => void;
  handleChannelSelect: (channel: Channel) => void;

  // Props
  channel: Channel;
  playlist: Channel[];
  onClose: () => void;
  onChannelChange?: (channel: Channel) => void;

  // State setters
  setIsPlaying: (playing: boolean) => void;
  setVolume: (vol: number) => void;
  setIsMuted: (muted: boolean) => void;
  setCurrentTime: (time: number) => void;
}

const FullScreenPlayerContext = createContext<FullScreenPlayerContextType | undefined>(undefined);

export const useFullScreenPlayerContext = () => {
  const context = useContext(FullScreenPlayerContext);
  if (context === undefined) {
    throw new Error('useFullScreenPlayerContext must be used within a FullScreenPlayerProvider');
  }
  return context;
};

interface FullScreenPlayerProviderProps {
  channel: Channel;
  playlist: Channel[];
  onClose: () => void;
  onChannelChange?: (channel: Channel) => void;
  children: ReactNode;
}

export const FullScreenPlayerProvider = ({
  channel,
  playlist,
  onClose,
  onChannelChange,
  children
}: FullScreenPlayerProviderProps) => {
  const playerState = useFullScreenPlayer({ channel, playlist, onClose, onChannelChange });

  return (
    <FullScreenPlayerContext.Provider value={playerState}>
      {children}
    </FullScreenPlayerContext.Provider>
  );
};
