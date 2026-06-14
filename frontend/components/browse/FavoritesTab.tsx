import { useBrowseContext } from "@/contexts/BrowseContext";
import ChannelGrid from "./ChannelGrid";
import FavoritesEmptyState from "./FavoritesEmptyState";
import FavoritesLoadingState from "./FavoritesLoadingState";

const FavoritesTab = () => {
  const { playlist, favorites, hasFavorites, isLoadingPlaylist } = useBrowseContext();

  if (isLoadingPlaylist && hasFavorites()) {
    return <FavoritesLoadingState />;
  }

  if (favorites.length > 0 && playlist.length > 0) {
    return <ChannelGrid showFavoritesOnly />;
  }

  if (hasFavorites() && playlist.length === 0) {
    return <FavoritesLoadingState />;
  }

  return <FavoritesEmptyState />;
};

export default FavoritesTab;

