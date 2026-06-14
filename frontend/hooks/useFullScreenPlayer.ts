'use client';

import useStream from "@/hooks/useStream";
import { usePlayerStore } from "@/store/useStore";
import { Channel } from "@/types";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

interface UseFullScreenPlayerProps {
  channel: Channel;
  playlist: Channel[];
  onClose: () => void;
  onChannelChange?: (channel: Channel) => void;
}

export const useFullScreenPlayer = ({ channel, playlist, onClose, onChannelChange }: UseFullScreenPlayerProps) => {
  const { videoRef, audioRef, error, isAudioOnly, isLive, duration } = useStream({
    url: channel.url,
    autoPlay: true,
  });

  const {
    favorites,
    toggleFavorite,
    volume: storedVolume,
    isMuted: storedIsMuted,
    setVolume: setStoredVolume,
    setIsMuted: setStoredIsMuted,
    playbackProgress,
    updatePlaybackProgress,
  } = usePlayerStore();

  const [isPlaying, setIsPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [showChannelList, setShowChannelList] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelListRef = useRef<HTMLDivElement>(null);
  const currentChannelRef = useRef<HTMLDivElement>(null);
  const lastProgressSaveRef = useRef<number>(0);
  const hasResumedRef = useRef<boolean>(false);

  const channelName = channel.baseName || channel.name;
  const isFavorite = favorites.includes(channelName);

  useEffect(() => {
    hasResumedRef.current = false;
  }, [channelName]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const mediaElement = video || audio;
    if (!mediaElement || isLive || hasResumedRef.current) return;

    const savedProgress = playbackProgress[channelName];
    if (savedProgress && savedProgress.currentTime > 0) {
      const timeoutId = setTimeout(() => {
        if (mediaElement.duration && isFinite(mediaElement.duration)) {
          if (savedProgress.currentTime / savedProgress.duration < 0.98) {
            mediaElement.currentTime = savedProgress.currentTime;
          }
        } else {
          mediaElement.currentTime = savedProgress.currentTime;
        }
        hasResumedRef.current = true;
      }, 500);
      return () => clearTimeout(timeoutId);
    } else {
      hasResumedRef.current = true;
    }
  }, [videoRef, audioRef, channelName, isLive, playbackProgress]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const mediaElement = video || audio;
    if (!mediaElement) return;

    mediaElement.volume = storedVolume;
    mediaElement.muted = storedIsMuted;
  }, [videoRef, audioRef, storedVolume, storedIsMuted]);

  const togglePlayPause = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const mediaElement = video || audio;
    if (!mediaElement) return;

    if (isPlaying) {
      mediaElement.pause();
    } else {
      mediaElement.play();
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, videoRef, audioRef]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const mediaElement = video || audio;
    if (!mediaElement) return;

    mediaElement.muted = !mediaElement.muted;
    setStoredIsMuted(mediaElement.muted);
  }, [videoRef, audioRef, setStoredIsMuted]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const resetControlsTimeout = () => {
      setShowControls(true);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    };

    const handleMouseMove = () => resetControlsTimeout();
    const handleKeyDown = () => resetControlsTimeout();

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("keydown", handleKeyDown);

    resetControlsTimeout();

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleKeyDown);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const mediaElement = video || audio;
    if (!mediaElement) return;

    const newVolume = parseFloat(e.target.value);
    mediaElement.volume = newVolume;
    setStoredVolume(newVolume);
    if (mediaElement.muted && newVolume > 0) {
      mediaElement.muted = false;
      setStoredIsMuted(false);
    }
  };

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const mediaElement = video || audio;
    if (!mediaElement) return;

    const newTime = parseFloat(e.target.value);
    mediaElement.currentTime = newTime;
    setCurrentTime(newTime);
  }, [videoRef, audioRef]);

  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    const mediaElement = video || audio;
    if (!mediaElement || isLive) return;

    const updateTime = () => {
      const current = mediaElement.currentTime;
      setCurrentTime(current);

      const now = Date.now();
      if (now - lastProgressSaveRef.current > 2000) {
        const duration = mediaElement.duration;
        if (duration && isFinite(duration) && duration > 0) {
          updatePlaybackProgress(channelName, current, duration);
          lastProgressSaveRef.current = now;
        }
      }
    };

    mediaElement.addEventListener("timeupdate", updateTime);
    return () => {
      mediaElement.removeEventListener("timeupdate", updateTime);
    };
  }, [videoRef, audioRef, isLive]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  useLayoutEffect(() => {
    if (showChannelList && channelListRef.current) {
      const currentIndex = playlist.findIndex(ch => ch.id === channel.id);
      if (currentIndex >= 0 && channelListRef.current) {
        requestAnimationFrame(() => {
          if (currentChannelRef.current && channelListRef.current) {
            const container = channelListRef.current;
            const item = currentChannelRef.current;

            const itemOffsetTop = item.offsetTop;
            const containerHeight = container.clientHeight;
            const itemHeight = item.offsetHeight;

            const targetScroll = itemOffsetTop - containerHeight / 2 + itemHeight / 2;

            container.scrollTop = Math.max(0, targetScroll);
          }
        });
      }
    }
  }, [showChannelList, channel.id, playlist]);

  const handleToggleControls = useCallback(() => {
    setShowControls(!showControls);
  }, [showControls]);

  const handleToggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(channel.baseName || channel.name);
  }, [channel.baseName, channel.name, toggleFavorite]);

  const handleToggleChannelList = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowChannelList(!showChannelList);
  }, [showChannelList]);

  const handleCloseChannelList = useCallback(() => {
    setShowChannelList(false);
  }, []);

  const handleChannelSelect = useCallback((selectedChannel: Channel) => {
    if (onChannelChange) {
      onChannelChange(selectedChannel);
    }
    setShowChannelList(false);
  }, [onChannelChange]);

  return {
    videoRef,
    audioRef,
    error,
    isAudioOnly,
    isLive,
    duration,
    isPlaying,
    isMuted: storedIsMuted,
    volume: storedVolume,
    currentTime,
    showControls,
    showChannelList,
    isFullscreen,
    isFavorite,
    channelListRef: channelListRef as React.RefObject<HTMLDivElement>,
    currentChannelRef: currentChannelRef as React.RefObject<HTMLDivElement>,
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
    handleVolumeChange,
    handleSeek,
    handleToggleControls,
    handleToggleFavorite,
    handleToggleChannelList,
    handleCloseChannelList,
    handleChannelSelect,
    channel,
    playlist,
    onClose,
    onChannelChange,
    setIsPlaying: (playing: boolean) => setIsPlaying(playing),
    setVolume: (vol: number) => setStoredVolume(vol),
    setIsMuted: (muted: boolean) => setStoredIsMuted(muted),
    setCurrentTime: (time: number) => setCurrentTime(time),
  };
};
