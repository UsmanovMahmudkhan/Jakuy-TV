import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Play, CheckCircle } from "lucide-react";
import { PredefinedPlaylist } from "@/types/playlist";
import { motion } from "framer-motion";

interface PlaylistCardProps {
  playlist: PredefinedPlaylist;
  isSelected: boolean;
  isLoading: boolean;
  onSelect: (playlist: PredefinedPlaylist) => void;
}

const PlaylistCard = ({ playlist, isSelected, isLoading, onSelect }: PlaylistCardProps) => {
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: isLoading ? 1 : 1.02 }}
      whileTap={{ scale: isLoading ? 1 : 0.98 }}
    >
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
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg font-semibold text-white mb-2">
                {playlist.name}
              </CardTitle>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="text-xs bg-neutral-800 text-neutral-300">
                  {playlist.category}
                </Badge>
                {playlist.legal && (
                  <Badge variant="outline" className="text-xs border-green-600 text-green-400">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Legal
                  </Badge>
                )}
              </div>
            </div>
            {isSelected && (
              <div className="text-red-500">
                <CheckCircle className="w-6 h-6" fill="currentColor" />
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <CardDescription className="text-neutral-400 text-sm leading-relaxed mb-4">
            {playlist.description}
          </CardDescription>
          <Button
            className={`w-full ${
              isSelected
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-neutral-800 hover:bg-neutral-700'
            } text-white font-medium h-10 text-sm`}
            disabled={isLoading}
            onClick={(e) => {
              e.stopPropagation();
              handleClick();
            }}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                Loading...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" fill="currentColor" />
                {isSelected ? 'Selected' : 'Select Playlist'}
              </span>
            )}
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PlaylistCard;
