'use client';

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, Play, Pause, Volume2, VolumeX, PanelRightOpen, Heart, Maximize, Minimize, SkipForward, SkipBack } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFullScreenPlayerContext } from "@/contexts/FullScreenPlayerContext";
import { Button } from "@/components/ui/button";

const formatTime = (seconds: number): string => {
  if (!isFinite(seconds) || isNaN(seconds)) return "0:00";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`;
};

const PlayerControls = () => {
  const {
    showControls,
    channel,
    playlist,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    isLive,
    duration,
    isFullscreen,
    isAudioOnly,
    isFavorite,
    onClose,
    onChannelChange,
    togglePlayPause,
    toggleMute,
    toggleFullscreen,
    handleVolumeChange,
    handleSeek,
    handleToggleFavorite,
    handleToggleChannelList,
  } = useFullScreenPlayerContext();

  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  const handlePrevChannel = () => {
    if (!onChannelChange || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(ch => ch.id === channel.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : playlist.length - 1;
    onChannelChange(playlist[prevIndex]);
  };

  const handleNextChannel = () => {
    if (!onChannelChange || playlist.length === 0) return;
    const currentIndex = playlist.findIndex(ch => ch.id === channel.id);
    const nextIndex = currentIndex < playlist.length - 1 ? currentIndex + 1 : 0;
    onChannelChange(playlist[nextIndex]);
  };

  return (
    <>
      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="absolute top-0 left-0 right-0 z-40 bg-linear-to-b from-black/80 via-black/40 to-transparent"
          >
            <div className="flex items-center justify-between px-8 py-5">
              <div className="flex items-center gap-5">
                <Button onClick={onClose} variant="ghost" size="icon" className="size-12 rounded transition-all hover:bg-white/10 cursor-pointer" tabIndex={0}>
                  <ChevronLeft className={"size-12"} />
                </Button>
                <span className="font-medium text-2xl text-white">{channel.baseName || channel.name}</span>
              </div>

              <div className="flex items-center gap-3">
                <Button onClick={handleToggleFavorite} variant="ghost" size="icon" className="size-12 rounded transition-all p-8 cursor-pointer" tabIndex={0}>
                  <Heart className={cn("size-12", isFavorite ? "fill-red-500 text-red-500" : "text-white")} />
                </Button>

                <Button onClick={handleToggleChannelList} variant="ghost" size="icon" className="size-12 rounded transition-all p-8 cursor-pointer" tabIndex={0}>
                  <PanelRightOpen className="size-12 text-white" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showControls && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
            className="absolute bottom-0 left-0 right-0 z-40 bg-linear-to-t from-black/80 via-black/40 to-transparent"
          >
            <div className="px-8 pb-8 pt-4">
              {!isAudioOnly && !isLive && (
                <div className="flex items-center pb-4">
                  <div className="flex-1 group relative">
                    <input
                      type="range"
                      min="0"
                      max={duration || 0}
                      step="0.1"
                      value={currentTime}
                      onChange={handleSeek}
                      onClick={e => e.stopPropagation()}
                      className="w-full h-4 bg-white/20 rounded-full appearance-none cursor-pointer slider-thumb group-hover:h-2.5 transition-all"
                      style={{
                        background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(currentTime / (duration || 1)) * 100}%, rgba(255,255,255,0.2) ${
                          (currentTime / (duration || 1)) * 100
                        }%, rgba(255,255,255,0.2) 100%)`,
                      }}
                      tabIndex={0}
                      title="Seek"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-base text-white/90 font-medium min-w-[140px] justify-end">
                    <span>{formatTime(currentTime)}</span>
                    <span className="text-white/50">/</span>
                    <span className="text-white/70">{formatTime(duration || 0)}</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {playlist.length > 1 && (
                    <Button
                      onClick={handlePrevChannel}
                      variant="ghost"
                      size="icon"
                      className="size-12 rounded transition-all hover:bg-white/10 cursor-pointer"
                      tabIndex={0}
                      title="Previous Channel"
                    >
                      <SkipBack className="size-12 text-white" />
                    </Button>
                  )}

                  <Button
                    onClick={togglePlayPause}
                    variant="ghost"
                    size="icon"
                    className="size-12 rounded transition-all hover:bg-white/10 cursor-pointer"
                    tabIndex={0}
                  >
                    {isPlaying ? <Pause className="size-12 text-white fill-white" /> : <Play className="size-12 text-white fill-white" />}
                  </Button>

                  {playlist.length > 1 && (
                    <Button
                      onClick={handleNextChannel}
                      variant="ghost"
                      size="icon"
                      className="size-12 rounded transition-all hover:bg-white/10 cursor-pointer"
                      tabIndex={0}
                      title="Next Channel"
                    >
                      <SkipForward className="size-12 text-white" />
                    </Button>
                  )}

                  <div
                    className="relative flex items-center"
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                  >
                    <Button
                      onClick={toggleMute}
                      variant="ghost"
                      size="icon"
                      className="size-12 rounded transition-all hover:bg-white/10 cursor-pointer"
                      tabIndex={0}
                    >
                      {isMuted || volume === 0 ? <VolumeX className="size-12 text-white" /> : <Volume2 className="size-12 text-white" />}
                    </Button>

                    <AnimatePresence>
                      {showVolumeSlider && (
                        <motion.div
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: 120 }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden ml-3"
                        >
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            onClick={e => e.stopPropagation()}
                            className="w-28 h-2 bg-white/30 rounded-full appearance-none cursor-pointer slider-thumb"
                            style={{
                              background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${(isMuted ? 0 : volume) * 100}%, rgba(255,255,255,0.3) ${
                                (isMuted ? 0 : volume) * 100
                              }%, rgba(255,255,255,0.3) 100%)`,
                            }}
                            tabIndex={0}
                            title="Volume"
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {isLive && (
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-600/20 rounded-full">
                      <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                      <span className="text-sm font-medium text-white">LIVE</span>
                    </div>
                  )}

                  <Button
                    onClick={toggleFullscreen}
                    variant="ghost"
                    size="icon"
                    className="size-12 rounded transition-all hover:bg-white/10 cursor-pointer"
                    tabIndex={0}
                  >
                    {isFullscreen ? <Minimize className="size-12 text-white" /> : <Maximize className="size-12 text-white" />}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PlayerControls;
