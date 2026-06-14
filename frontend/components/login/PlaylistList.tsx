import { IptvOrgPlaylist } from "@/lib/iptv-org-playlists";
import { PredefinedPlaylist } from "@/types/playlist";
import PlaylistRow from "./PlaylistRow";

interface PlaylistListProps {
  playlists: (PredefinedPlaylist | IptvOrgPlaylist)[];
  selectedPlaylistId?: string;
  isLoading: boolean;
  error?: string | null;
  onSelect: (playlist: PredefinedPlaylist) => void;
  type: 'predefined' | 'github';
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
}

export const PlaylistList = ({
  playlists,
  selectedPlaylistId,
  isLoading,
  error,
  onSelect,
  type,
  emptyMessage = "No playlists found.",
  loadingMessage = "Loading playlists...",
  errorMessage = "Error loading playlists",
}: PlaylistListProps) => {
  if (error) {
    return (
      <div className="text-center py-4 text-red-400">
        {errorMessage}: {error}
      </div>
    );
  }

  if (isLoading && playlists.length === 0) {
    return (
      <div className="text-center py-8 text-neutral-400">
        {loadingMessage}
      </div>
    );
  }

  if (playlists.length === 0) {
    return (
      <div className="text-center py-4 text-neutral-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 flex-1 overflow-y-auto w-full min-h-0">
      {playlists.map((playlist) => {
        if (type === 'predefined') {
          const predefinedPlaylist = playlist as PredefinedPlaylist;
          return (
            <PlaylistRow
              key={predefinedPlaylist.id}
              playlist={predefinedPlaylist}
              isSelected={selectedPlaylistId === predefinedPlaylist.id}
              isLoading={isLoading}
              onSelect={onSelect}
            />
          );
        } else {
          const githubPlaylist = playlist as IptvOrgPlaylist;
          return (
            <PlaylistRow
              key={githubPlaylist.id}
              playlist={{
                id: githubPlaylist.id,
                name: `${githubPlaylist.name} `,
                description: `${githubPlaylist.channelCount || 0} channels`,
                url: githubPlaylist.url,
                category: githubPlaylist.category,
              }}
              isSelected={selectedPlaylistId === githubPlaylist.id}
              isLoading={isLoading}
              onSelect={onSelect}
            />
          );
        }
      })}
    </div>
  );
};