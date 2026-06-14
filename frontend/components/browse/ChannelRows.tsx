'use client';

import { useMemo } from "react";
import { usePlayerStore } from "@/store/useStore";
import { getUniqueChannelsByBaseName, parseQuality } from "@/lib/parser";
import { Heart, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ChannelRowsProps {
  showFavoritesOnly?: boolean;
}

const ChannelRows = ({ showFavoritesOnly = false }: ChannelRowsProps) => {
  const { playlist, favorites, activeChannel, setActiveChannel, toggleFavorite, searchQuery } = usePlayerStore();

  const groupedChannels = useMemo(() => {
    playlist.forEach(channel => {
      if (!channel.baseName) {
        const { baseName, quality } = parseQuality(channel.name);
        channel.baseName = baseName;
        channel.quality = quality;
      }
    });
    let channels = getUniqueChannelsByBaseName(playlist);

    if (showFavoritesOnly) {
      channels = channels.filter(c => favorites.includes(c.baseName || c.name));
    }

    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      channels = channels.filter(c => c.name.toLowerCase().includes(lowerQuery));
    }

    const grouped: Record<string, typeof channels> = {};

    if (showFavoritesOnly) {
      grouped["Favorites"] = channels;
    } else {
      channels.forEach(channel => {
        const group = channel.groupTitle || "Uncategorized";
        if (!grouped[group]) {
          grouped[group] = [];
        }
        grouped[group].push(channel);
      });
    }

    return grouped;
  }, [playlist, favorites, searchQuery, showFavoritesOnly]);

  const groupNames = Object.keys(groupedChannels);

  if (groupNames.length === 0 || groupNames.every(g => groupedChannels[g].length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-neutral-500">
        <p className="text-xl">{showFavoritesOnly ? "No favorites yet." : "No channels found."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      {groupNames.map(groupName => {
        const channels = groupedChannels[groupName];
        if (channels.length === 0) return null;

        return (
          <section key={groupName} className="space-y-4">
            <h2 className="text-2xl font-bold text-white px-8">{groupName}</h2>

            <div className="relative">
              <div
                className="flex gap-4 overflow-x-auto px-8 pb-4 scrollbar-hide scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              >
                {channels.slice(0, 50).map(channel => (
                  <motion.div
                    key={channel.id}
                    role="button"
                    onClick={() => setActiveChannel(channel)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setActiveChannel(channel);
                      }
                    }}
                    className={cn(
                      "relative shrink-0 w-52 aspect-video rounded-2xl overflow-hidden cursor-pointer",
                      "bg-neutral-900 border-2 border-transparent",
                      "transition-all duration-300 ease-out",
                      "focus:outline-none focus-visible:scale-110 focus-visible:border-red-500 focus-visible:shadow-2xl focus-visible:shadow-red-500/30 focus-visible:z-10",
                      "hover:scale-105 hover:border-neutral-700 hover:z-10",
                      activeChannel?.id === channel.id && "border-red-500 scale-105"
                    )}
                    whileFocus={{ scale: 1.1 }}
                    tabIndex={0}
                  >
                    {channel.logo ? (
                      <Image
                        src={channel.logo}
                        alt={channel.baseName || channel.name}
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
                      <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-neutral-800 to-neutral-900">
                        <span className="text-neutral-600 font-bold text-lg text-center px-2 line-clamp-2">{channel.baseName || channel.name}</span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-focus-visible:opacity-100 hover:opacity-100 focus-within:opacity-100 transition-opacity">
                      <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-xl">
                        <Play className="w-7 h-7 text-white fill-white ml-1" />
                      </div>
                    </div>

                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <p className="text-white font-semibold text-sm truncate drop-shadow-lg">{channel.baseName || channel.name}</p>
                    </div>

                    <Button
                      onClick={e => {
                        e.stopPropagation();
                        toggleFavorite(channel.baseName || channel.name);
                      }}
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "absolute top-2 right-2 p-2 rounded-full",
                        "bg-black/50 hover:bg-black/80 transition-colors",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                      )}
                      tabIndex={0}
                    >
                      <Heart
                        className={cn("w-4 h-4", favorites.includes(channel.baseName || channel.name) ? "fill-red-500 text-red-500" : "text-white")}
                      />
                    </Button>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default ChannelRows;
