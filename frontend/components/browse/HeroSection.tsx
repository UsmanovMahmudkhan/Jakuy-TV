'use client';

import { useMemo } from "react";
import Image from "next/image";
import { usePlayerStore } from "@/store/useStore";
import VideoPlayer from "@/components/player/VideoPlayer";
import { Play } from "lucide-react";
import { motion } from "framer-motion";
import { getChannelDescription } from "@/lib/epg";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const HeroSection = () => {
  const { activeChannel, setActiveChannel, playlist, favorites, recentlyWatched, epgData, isLoadingEpg, savedEpgUrl } = usePlayerStore();

  const playingChannel = useMemo(() => {
    if (activeChannel) return activeChannel;
    if (recentlyWatched.length > 0) {
      const latestWatchedChannel = playlist.find(c => c.name === recentlyWatched[0]);
      if (latestWatchedChannel) return latestWatchedChannel;
    }
    if (favorites.length > 0) {
      return playlist.find(c => favorites.includes(c.name)) || playlist[0];
    }
    const aggregatedChannels = playlist;
    return aggregatedChannels[0];
  }, [activeChannel, playlist, favorites, recentlyWatched]);

  const channelDescription = useMemo(() => {
    if (epgData && playingChannel) {
      return getChannelDescription(playingChannel.name, epgData);
    }
    return null;
  }, [epgData, playingChannel]);

  const title = playingChannel?.baseName || playingChannel?.name || "";
  const titleFontSize = useMemo(() => {
    if (title.length > 30) return "text-2xl sm:text-4xl md:text-6xl";
    if (title.length > 20) return "text-3xl sm:text-5xl md:text-7xl";
    return "text-3xl sm:text-5xl md:text-8xl";
  }, [title]);

  if (!playingChannel) {
    return (
      <div className="relative w-full h-[80vh] bg-neutral-950 flex items-center justify-center">
        <p className="text-neutral-500 text-xl">No channels available</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[70vh] md:h-[80vh] min-h-[700px] overflow-hidden group/hero flex flex-col justify-end">
      {/* Desktop: live video backdrop. Mobile: static logo backdrop (avoids loading a stream on first paint). */}
      <div className="absolute inset-0 hidden md:block">
        <VideoPlayer key={playingChannel.id} url={playingChannel.url} autoPlay={true} controls={false} muted={true} className="object-cover" />
      </div>
      <div className="absolute inset-0 md:hidden bg-neutral-900">
        {playingChannel.logo && (
          <Image
            src={playingChannel.logo}
            alt={title}
            fill
            sizes="100vw"
            priority
            unoptimized
            className="object-cover scale-110 blur-sm brightness-75"
          />
        )}
      </div>

      <div className="absolute inset-0 bg-linear-to-r from-neutral-950/90 via-neutral-950/40 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-linear-to-t from-neutral-950 via-neutral-950/80 to-transparent pointer-events-none" />

      <div className="relative w-full px-8 pb-24 md:pb-64 z-10 pt-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          key={playingChannel.id}
          className="max-w-2xl"
        >
          <h1 className={cn(
            "font-bold text-white mb-3 md:mb-6 drop-shadow-xl tracking-tight leading-tight transition-all duration-500 truncate w-full",
            titleFontSize
          )}>
            {title}
          </h1>

          <div className="mb-3 md:mb-6">
            {isLoadingEpg ? (
              <div className="flex flex-col gap-2">
                <Skeleton className="h-4 md:h-5 w-48 sm:w-64 md:w-125 bg-neutral-700" />
                <Skeleton className="h-4 md:h-5 w-48 sm:w-64 md:w-125 bg-neutral-700" />
              </div>
            ) : channelDescription ? (
              <span className="text-white text-base md:text-xl line-clamp-3 md:line-clamp-none max-w-2xl block">{channelDescription}</span>
            ) : savedEpgUrl ? (
              <span className="text-neutral-400 text-base md:text-xl">No Program Data</span>
            ) : (
              <span className="text-neutral-400 text-base md:text-xl">No EPG Available</span>
            )}
          </div>

          {playingChannel.groupTitle && (
            <div className="mb-5 md:mb-8">
              <span className="text-xs md:text-xl font-medium text-white/90 bg-white/10 px-3 py-1 md:px-5 md:py-2 rounded-full backdrop-blur-md">
                {playingChannel.groupTitle}
              </span>
            </div>
          )}

          <motion.div>
            <Button
              onClick={() => setActiveChannel(playingChannel)}
              className="group relative flex items-center gap-2 md:gap-3 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 md:px-8 md:py-4 rounded-xl transition-all duration-300 shadow-2xl hover:shadow-red-500/25 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-neutral-950 text-base md:text-xl h-auto cursor-pointer"
            >
              <Play className="w-4 h-4 md:w-5 md:h-5 ml-0.5" fill="currentColor" />
              <span>Watch Now</span>
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
