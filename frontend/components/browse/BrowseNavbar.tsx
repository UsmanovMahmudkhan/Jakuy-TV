'use client';

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import JakuyLogo from "@/components/JakuyLogo";
import { useAppContext } from "@/contexts/AppContext";
import { Tab } from "@/types";
import { Button } from "@/components/ui/button";

const BrowseNavbar = () => {
  const { activeTab, handleTabChange } = useAppContext();

  const getActiveTabIndex = () => {
    const tabs = [Tab.FOR_YOU, Tab.ALL, Tab.FAVORITES];
    return tabs.indexOf(activeTab);
  };

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4
                  bg-linear-to-b
                  from-neutral-950/80
                  via-neutral-950/40
                  to-transparent"
    >
      <div className="w-full flex items-center justify-between relative">
        <a
          href="#"
          className="flex items-center gap-2 px-1 shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded-full cursor-default"
          tabIndex={0}
        >
          <JakuyLogo className="size-8 md:size-10" />
          <span className="text-lg md:text-xl font-bold text-white hidden lg:block">Jakuy TV</span>
        </a>

        <div className="flex items-center gap-1 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-full p-1 shadow-xl mx-2 overflow-x-auto no-scrollbar max-w-[60%] sm:max-w-none">
          <Button
            onClick={() => handleTabChange(Tab.FOR_YOU)}
            variant="ghost"
            className={cn(
              "relative z-10 px-3 md:px-6 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-out cursor-pointer whitespace-nowrap",
              "focus:outline-none",
              activeTab === Tab.FOR_YOU ? "text-white bg-red-600 shadow-lg" : "text-neutral-400 hover:text-white"
            )}
            tabIndex={0}
          >
            For You
          </Button>
          <Button
            onClick={() => handleTabChange(Tab.ALL)}
            variant="ghost"
            className={cn(
              "relative z-10 px-3 md:px-6 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-out cursor-pointer whitespace-nowrap",
              "focus:outline-none",
              activeTab === Tab.ALL ? "text-white bg-red-600 shadow-lg" : "text-neutral-400 hover:text-white"
            )}
            tabIndex={0}
          >
            All
          </Button>
          <Button
            onClick={() => handleTabChange(Tab.FAVORITES)}
            variant="ghost"
            className={cn(
              "relative z-10 px-3 md:px-6 py-1.5 md:py-2.5 rounded-full text-xs md:text-sm font-medium transition-all duration-300 ease-out cursor-pointer whitespace-nowrap",
              "focus:outline-none",
              activeTab === Tab.FAVORITES ? "text-white bg-red-600 shadow-lg" : "text-neutral-400 hover:text-white"
            )}
            tabIndex={0}
          >
            Favorites
          </Button>
        </div>

        {/* Spacer keeps the tab group centered now that the logout action is removed. */}
        <div className="size-8 md:size-10 shrink-0" aria-hidden="true" />
      </div>
    </nav>
  );
};

export default BrowseNavbar;
