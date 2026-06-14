'use client';

import { useMemo } from 'react';
import { usePlayerStore } from '@/store/useStore';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ChannelGridProps {
  showFavoritesOnly?: boolean;
}

const ChannelGrid = ({ showFavoritesOnly = false }: ChannelGridProps) => {
  const {
    playlist,
    favorites,
    activeChannel,
    setActiveChannel,
    toggleFavorite,
    searchQuery,
    playbackProgress,
  } = usePlayerStore();

  const filteredChannels = useMemo(() => {
    playlist.forEach(channel => {
      if (!channel.baseName) {
        channel.baseName = channel.name;
      }
    });
    let channels = playlist;

    if (showFavoritesOnly) {
      channels = channels.filter(c => favorites.includes(c.baseName || c.name));
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      channels = channels.filter(c => c.name.toLowerCase().includes(lowerQuery));
    }

    return channels.slice(0, 200);
  }, [playlist, favorites, searchQuery, showFavoritesOnly]);

  if (filteredChannels.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-neutral-500">
        <p className="text-xl">{showFavoritesOnly ? "No favorites yet." : "No channels found."}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 px-8 pb-20">
      {filteredChannels.map(channel => {
        const channelName = channel.baseName || channel.name;
        const progress = playbackProgress[channelName];
        const progressPercent = progress ? (progress.currentTime / progress.duration) * 100 : 0;

        return (
          <div
            key={channel.id}
            role="button"
            onClick={() => setActiveChannel(channel)}
            onKeyDown={e => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setActiveChannel(channel);
              }
            }}
            className="group cursor-pointer focus:outline-none"
            tabIndex={0}
          >
            <div
              className={cn(
                "relative aspect-video rounded-lg overflow-hidden",
                "bg-neutral-900 border-2 border-transparent",
                "transition-all duration-300 ease-out",
                "group-hover:border-red-500 group-hover:shadow-[inset_0_0_0_2px_rgba(239,68,68,0.8),0_0_15px_rgba(239,68,68,0.4)]",
                "group-focus-visible:border-red-500 group-focus-visible:shadow-[inset_0_0_0_2px_rgba(239,68,68,0.8),0_0_15px_rgba(239,68,68,0.4)] group-focus-visible:scale-105",
                activeChannel?.id === channel.id && "border-red-500 shadow-[inset_0_0_0_2px_rgba(239,68,68,0.8),0_0_20px_rgba(239,68,68,0.4)]"
              )}
            >
              {channel.logo ? (
                <Image
                  src={channel.logo}
                  alt={channelName}
                  fill
                  sizes="(max-width: 768px) 50vw, 20vw"
                  loading="lazy"
                  className="object-cover opacity-0 transition-opacity duration-300"
                  unoptimized
                  onLoad={e => (e.currentTarget as HTMLImageElement).classList.add("opacity-100")}
                  onError={e => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
              ) : null}

              {channel.online && (
                <span className="absolute top-1.5 left-1.5 z-10 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                  Live
                </span>
              )}

              <div
                className={cn(
                  "w-full h-full flex items-center justify-center bg-linear-to-br from-neutral-800 to-neutral-900",
                  channel.logo ? "hidden" : ""
                )}
              >
                <span className="text-neutral-600 font-semibold text-xs text-center px-2 line-clamp-2">{channel.baseName || channel.name}</span>
              </div>

              {/* Progress Bar */}
              {progressPercent > 0 && progressPercent < 98 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
                  <div 
                    className="h-full bg-red-600 transition-all duration-300" 
                    style={{ width: `${progressPercent}%` }} 
                  />
                </div>
              )}

              <Button
                onClick={e => {
                  e.stopPropagation();
                  toggleFavorite(channelName);
                }}
                variant="ghost"
                size="icon"
                className={cn(
                  "absolute top-1.5 right-1.5 p-1.5 rounded-full",
                  "bg-black/60 hover:bg-black/80 transition-all",
                  "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500",
                  favorites.includes(channelName) && "opacity-100"
                )}
                tabIndex={-1}
              >
                <Heart
                  className={cn("w-3.5 h-3.5", favorites.includes(channelName) ? "fill-red-500 text-red-500" : "text-white")}
                />
              </Button>
            </div>

            <p
              className={cn(
                "mt-2 text-sm font-medium text-center truncate px-1",
                "text-neutral-300 transition-colors duration-200",
                "md:text-transparent md:group-hover:text-white md:group-focus-visible:text-white"
              )}
            >
              {channelName}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default ChannelGrid;
