'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { usePlayerStore } from '@/store/useStore';
import { Channel } from "@/types";
import { Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ChannelCarouselProps {
  category?: string;
  channels?: Channel[];
  limit?: number;
}

const ChannelCarousel = ({ category, channels: propChannels, limit = 50 }: ChannelCarouselProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const {
    playlist,
    favorites,
    activeChannel,
    setActiveChannel,
    toggleFavorite,
    searchQuery,
    playbackProgress,
  } = usePlayerStore();

  let filteredChannels = propChannels || playlist;

  if (category) {
    filteredChannels = filteredChannels.filter(c => c.groupTitle === category);
  }

  if (searchQuery) {
    filteredChannels = filteredChannels.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }

  filteredChannels = filteredChannels.slice(0, limit);

  const checkScrollPosition = useCallback(() => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  }, []);

  useEffect(() => {
    const ref = scrollRef.current;
    if (ref) {
      checkScrollPosition();
      ref.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
      return () => {
        ref.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      };
    }
  }, [checkScrollPosition, filteredChannels]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (filteredChannels.length === 0) {
    return null;
  }

  return (
    <div className="relative group/carousel">
      {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 z-20 flex items-center">
          <div className="h-full w-24 bg-linear-to-r from-neutral-950 via-neutral-950/80 to-transparent flex items-center pl-4">
            <Button
              onClick={() => scroll("left")}
              variant="ghost"
              size="icon"
              className={cn(
                "p-3 rounded-full",
                "bg-black/80 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity",
                "hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              )}
              tabIndex={-1}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 z-20 flex items-center">
          <div className="h-full w-24 bg-linear-to-l from-neutral-950 via-neutral-950/80 to-transparent flex items-center justify-end pr-4">
            <Button
              onClick={() => scroll("right")}
              variant="ghost"
              size="icon"
              className={cn(
                "p-3 rounded-full",
                "bg-black/80 text-white opacity-0 group-hover/carousel:opacity-100 transition-opacity",
                "hover:bg-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              )}
              tabIndex={-1}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-8 py-5 scroll-smooth scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
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
              className="group shrink-0 cursor-pointer focus:outline-none"
              tabIndex={0}
            >
              <div
                className={cn(
                  "relative w-72 aspect-video rounded-xl overflow-hidden",
                  "bg-neutral-900 border-2 border-transparent",
                  "transition-all duration-300 ease-out",
                  "group-hover:border-red-500 group-hover:shadow-[inset_0_0_0_2px_rgba(239,68,68,0.8),0_0_20px_rgba(239,68,68,0.3)] group-hover:scale-105",
                  "group-focus-visible:border-red-500 group-focus-visible:shadow-[inset_0_0_0_2px_rgba(239,68,68,0.8),0_0_20px_rgba(239,68,68,0.3)] group-focus-visible:scale-105",
                  activeChannel?.id === channel.id &&
                    "border-red-500 shadow-[inset_0_0_0_2px_rgba(239,68,68,0.8),0_0_25px_rgba(239,68,68,0.5)] scale-105 ring-2 ring-red-500"
                )}
              >
                {channel.logo ? (
                  <Image
                    src={channel.logo}
                    alt={channelName}
                    fill
                    sizes="(max-width: 768px) 40vw, 16vw"
                    loading="lazy"
                    className="object-cover opacity-0 transition-opacity duration-300"
                    unoptimized
                    onLoad={e => (e.currentTarget as HTMLImageElement).classList.add("opacity-100")}
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-neutral-700 to-neutral-800">
                    <span className="text-neutral-400 font-semibold text-xs text-center px-2 line-clamp-2">{channel.name}</span>
                  </div>
                )}

                <div
                  className={cn(
                    "absolute inset-0 bg-linear-to-t from-black/80 to-transparent",
                    "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
                  )}
                />

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
                    "absolute top-2 right-2 p-1.5 rounded-full",
                    "bg-black/60 hover:bg-red-600 transition-all",
                    "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-white",
                    favorites.includes(channelName) && "opacity-100 bg-red-600"
                  )}
                  tabIndex={-1}
                >
                  <Heart className={cn("w-4 h-4", favorites.includes(channelName) ? "fill-white text-white" : "text-white")} />
                </Button>

                {activeChannel?.id === channel.id && (
                  <Badge className="absolute bottom-2 left-2 bg-red-600 text-white border-red-600 flex items-center gap-1.5 px-2 py-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span className="text-xs font-medium">Playing</span>
                  </Badge>
                )}
              </div>

              <p
                className={cn(
                  "mt-2 text-sm font-medium text-center truncate w-72",
                  "text-neutral-500 transition-colors duration-200",
                  "group-hover:text-white group-focus-visible:text-white",
                  activeChannel?.id === channel.id && "text-white"
                )}
              >
                {channelName}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChannelCarousel;
