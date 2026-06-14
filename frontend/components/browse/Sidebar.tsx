'use client';

import { usePlayerStore } from '@/store/useStore';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from "@/components/ui/separator";
import { Heart, List, Tv2 } from "lucide-react";
import { motion } from 'framer-motion';

const Sidebar = () => {
  const { groups, isSidebarOpen, resetSession, activeGroup, setActiveGroup } = usePlayerStore();

  return (
    <motion.div
      initial={false}
      animate={{ width: isSidebarOpen ? 250 : 0, opacity: isSidebarOpen ? 1 : 0 }}
      className="h-screen bg-black/90 border-r border-neutral-800 flex flex-col overflow-hidden"
    >
      <div className="p-4 flex items-center gap-2">
        <div className="w-8 h-8 bg-red-600 rounded flex items-center justify-center shrink-0">
          <Tv2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-lg tracking-wider text-red-500 whitespace-nowrap">M3U FLIX</span>
      </div>
      <Separator />

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-1">
          <Button
            variant={activeGroup === "All" ? "secondary" : "ghost"}
            className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={() => setActiveGroup("All")}
          >
            <List className="mr-2 h-4 w-4" />
            All Channels
          </Button>
          <Button
            variant={activeGroup === "Favorites" ? "secondary" : "ghost"}
            className="w-full justify-start text-neutral-400 hover:text-white hover:bg-neutral-800"
            onClick={() => setActiveGroup("Favorites")}
          >
            <Heart className="mr-2 h-4 w-4" />
            Favorites
          </Button>

          <div className="py-2"></div>
          <div className="px-4 text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Categories</div>

          {groups.map(group => (
            <Button
              key={group}
              variant={activeGroup === group ? "secondary" : "ghost"}
              className="w-full justify-start text-sm text-neutral-400 hover:text-white hover:bg-neutral-800 truncate"
              onClick={() => setActiveGroup(group)}
            >
              <span className="truncate">{group}</span>
            </Button>
          ))}
        </div>
      </ScrollArea>

      <Separator />
      <div className="p-4">
        <Button variant="destructive" className="w-full text-xs" onClick={resetSession}>
          Close Playlist
        </Button>
      </div>
    </motion.div>
  );
};

export default Sidebar;
