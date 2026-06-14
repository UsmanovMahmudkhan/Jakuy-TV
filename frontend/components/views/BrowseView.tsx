import { AnimatePresence } from "framer-motion";
import { BrowseProvider, useBrowseContext } from "@/contexts/BrowseContext";
import FullScreenVideoPlayer from "@/components/player/FullScreenVideoPlayer";
import BrowseContainer from "@/components/browse/BrowseContainer";

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
 