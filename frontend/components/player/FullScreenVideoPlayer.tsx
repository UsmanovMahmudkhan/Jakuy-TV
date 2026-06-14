'use client';

import { motion } from "framer-motion";
import { Channel } from "@/types";
import { FullScreenPlayerProvider, useFullScreenPlayerContext } from "@/contexts/FullScreenPlayerContext";
import PlayerControls from "./PlayerControls";
import ChannelList from "./ChannelList";
import StreamError from "./StreamError";

interface FullScreenVideoPlayerProps {
  channel: Channel;
  playlist: Channel[];
  onClose: () => void;
  onChannelChange?: (channel: Channel) => void;
}

interface FullScreenVideoPlayerContentProps {
  channel: Channel;
  onChannelChange?: (channel: Channel) => void;
}

const FullScreenVideoPlayerContent = ({ channel, onChannelChange }: FullScreenVideoPlayerContentProps) => {
  const { 
    videoRef, 
    audioRef, 
    error, 
    isAudioOnly,
    handleToggleControls, 
    setIsPlaying, 
    setVolume, 
    setIsMuted 
  } = useFullScreenPlayerContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Media Player */}
      <div className="relative w-full h-full">
        {error ? (
          <StreamError error={error} />
        ) : isAudioOnly ? (
          <audio
            ref={audioRef}
            className="hidden"
            controls={false}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onVolumeChange={e => {
              const audio = e.target as HTMLAudioElement;
              setVolume(audio.volume);
              setIsMuted(audio.muted);
            }}
          />
        ) : (
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
            controls={false}
          playsInline
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onVolumeChange={e => {
            const video = e.target as HTMLVideoElement;
            setVolume(video.volume);
            setIsMuted(video.muted);
          }}
        />
        )}

        {/* Radio/Audio-only visual placeholder */}
        {isAudioOnly && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-linear-to-br from-red-600 to-red-800 flex items-center justify-center shadow-2xl">
                <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Radio Stream</h2>
              <p className="text-neutral-400">Now Playing</p>
            </div>
          </div>
        )}

        <PlayerControls />
        <ChannelList />

        {/* Click to show controls */}
        <div className="absolute inset-0 cursor-pointer" onClick={handleToggleControls} />
      </div>
    </motion.div>
  );
};

const FullScreenVideoPlayer = ({ channel, playlist, onClose, onChannelChange }: FullScreenVideoPlayerProps) => {
  return (
    <FullScreenPlayerProvider channel={channel} playlist={playlist} onClose={onClose} onChannelChange={onChannelChange}>
      <FullScreenVideoPlayerContent channel={channel} onChannelChange={onChannelChange} />
    </FullScreenPlayerProvider>
  );
};

export default FullScreenVideoPlayer;
