'use client';

import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useFullScreenPlayerContext } from "@/contexts/FullScreenPlayerContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const ChannelList = () => {
  const {
    showChannelList,
    playlist,
    channel,
    channelListRef,
    currentChannelRef,
    handleCloseChannelList,
    handleChannelSelect,
  } = useFullScreenPlayerContext();
  return (
    <AnimatePresence>
      {showChannelList && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleCloseChannelList}
            className="fixed inset-0 bg-black/50 z-50"
          />

          <motion.div
            ref={channelListRef}
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 bottom-0 w-96 bg-transparent to-neutral-900/0 z-60"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-between p-6 pb-2">
                <h2 className="text-xl font-bold text-white">Channels</h2>
                <Button onClick={handleCloseChannelList} variant="ghost"
                    size="icon"
                    className="size-12 rounded transition-all hover:bg-white/10 cursor-pointer"
                    tabIndex={0}>
                  <ChevronRight className={"size-12"} />
                </Button>
              </div>

              <div className="flex-1 overflow-y-auto px-6">
                <div className="space-y-3">
                {playlist.map(ch => (
                  <div
                    key={ch.id}
                    ref={ch.id === channel.id ? currentChannelRef : null}
                    role="button"
                    onClick={() => handleChannelSelect(ch)}
                    onKeyDown={e => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleChannelSelect(ch);
                      }
                    }}
                    className={cn(
                      "flex items-center gap-4 p-5 rounded-lg cursor-pointer transition-all duration-200",
                      "hover:bg-neutral-800 focus:outline-none focus:ring-2 focus:ring-red-500",
                      ch.id === channel.id && "bg-red-600 hover:bg-red-700"
                    )}
                    tabIndex={0}
                  >
                    <div className="w-24 h-18 rounded-lg overflow-hidden bg-neutral-700 shrink-0">
                      {ch.logo ? (
                        <Image src={ch.logo} alt={ch.name} width={96} height={72} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-linear-to-br from-neutral-600 to-neutral-700">
                          <span className="text-neutral-400 font-semibold text-xs text-center">{ch.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-white font-medium text-lg truncate">
                          {ch.baseName || ch.name}
                          {ch.quality && <span className="text-neutral-400 ml-1">({ch.quality})</span>}
                        </h3>
                        {ch.id === channel.id && (
                          <Badge className="bg-red-600 text-white border-red-600 flex items-center gap-1 px-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            <span className="text-xs font-medium">Playing</span>
                          </Badge>
                        )}
                      </div>
                      {ch.groupTitle && <p className="text-neutral-400 text-base truncate">{ch.groupTitle}</p>}
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ChannelList;
