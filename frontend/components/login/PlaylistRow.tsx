import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PredefinedPlaylist } from "@/types/playlist";
import { Play } from "lucide-react";

interface PlaylistRowProps {
  playlist: PredefinedPlaylist;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (playlist: PredefinedPlaylist) => void;
}

const PlaylistRow = ({ playlist, isSelected, isLoading, onSelect }: PlaylistRowProps) => {
  const handleClick = () => {
    if (!isLoading) {
      onSelect(playlist);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  return (
      <Card
        className={`cursor-pointer transition-all duration-200 border-2 ${
          isSelected
            ? 'border-red-600 bg-red-950/20 shadow-lg shadow-red-900/20'
            : 'border-neutral-800 hover:border-neutral-700 bg-neutral-900/50 hover:bg-neutral-800/50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="button"
        aria-label={`Select ${playlist.name} playlist`}
        aria-pressed={isSelected}
      >
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-lg font-semibold text-white truncate">
                  {playlist.name}
                </h3>

              </div>
              <p className="text-neutral-400 text-sm leading-relaxed line-clamp-2">
                {playlist.description}
              </p>
            </div>
            <div className="flex items-center gap-3 ml-4">
              <Button
                className={`${
                  isSelected
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-neutral-800 hover:bg-neutral-700'
                } text-white font-medium h-9 px-4 text-sm`}
                disabled={isLoading}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick();
                }}
              >
                {isLoading && isSelected ? (
                  <span>Loading...</span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Play className="w-4 h-4" fill="currentColor" />
                    {isSelected ? 'Selected' : 'Select'}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
  );
};

export default PlaylistRow;
