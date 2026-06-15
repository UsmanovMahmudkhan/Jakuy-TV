import dynamic from "next/dynamic";
import { AnimatePresence } from "framer-motion";
import { BrowseProvider, useBrowseContext } from "@/contexts/BrowseContext";
import BrowseContainer from "@/components/browse/BrowseContainer";

// The fullscreen player pulls in hls.js (~140 KB). It is only needed once the
// user opens a channel, so keep it out of the first-load bundle.
const FullScreenVideoPlayer = dynamic(
  () => import("@/components/player/FullScreenVideoPlayer"),
  { ssr: false }
);

const BrowseContent = () => {
  const { activeChannel, playlist, setActiveChannel } = useBrowseContext();

  return (
    <AnimatePresence>
      {activeChannel ? (
        <FullScreenVideoPlayer
          key={`fullscreen-player-${activeChannel.id}`}
          channel={activeChannel}
          playlist={playlist}
          onClose={() => setActiveChannel(null)}
          onChannelChange={setActiveChannel}
        />
      ) : (
        <BrowseContainer />
      )}
    </AnimatePresence>
  );
};

const BrowseView = () => {
  return (
    <BrowseProvider>
      <BrowseContent />
    </BrowseProvider>
  );
};

export default BrowseView;
 