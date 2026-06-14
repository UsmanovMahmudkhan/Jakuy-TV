import { useBrowseContext } from '@/contexts/BrowseContext';
import ChannelCarousel from './ChannelCarousel';

const ContinueWatchingSection = () => {
  const { getContinueWatchingChannels } = useBrowseContext();
  const continueWatchingData = getContinueWatchingChannels();

  return (
    <div>
      <div className="px-8 mb-4">
        <h2 className="text-2xl font-bold text-white">
          {continueWatchingData.isContinueWatching ? "Continue Watching" : "Start Watching"}
        </h2>
      </div>
      <ChannelCarousel channels={continueWatchingData.channels} />
    </div>
  );
};

export default ContinueWatchingSection;

