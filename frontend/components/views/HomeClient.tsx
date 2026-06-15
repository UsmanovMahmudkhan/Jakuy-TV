'use client';

import { MotionConfig } from "framer-motion";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { PageView, Playlist } from "@/types";
import LoadingView from "@/components/views/LoadingView";
import BrowseView from "@/components/views/BrowseView";

const AppShell = () => {
  const { currentView, loadError } = useAppContext();

  if (loadError && currentView !== PageView.BROWSE) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center px-6">
        <div className="max-w-md text-center flex flex-col gap-3">
          <h1 className="text-2xl font-bold text-white">Jakuy TV</h1>
          <p className="text-neutral-400">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="mx-auto mt-2 rounded-full bg-red-600 px-6 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {currentView === PageView.LOADING && <LoadingView />}
      {currentView === PageView.BROWSE && <BrowseView />}
    </>
  );
};

interface HomeClientProps {
  initialPlaylist: Playlist;
}

const HomeClient = ({ initialPlaylist }: HomeClientProps) => {
  return (
    <MotionConfig reducedMotion="user">
      <AppProvider initialPlaylist={initialPlaylist}>
        <AppShell />
      </AppProvider>
    </MotionConfig>
  );
};

export default HomeClient;
