import { useBrowseContext } from "@/contexts/BrowseContext";
import { Skeleton } from "@/components/ui/skeleton";

const FavoritesLoadingState = () => {
  const { isLoadingPlaylist } = useBrowseContext();

  if (isLoadingPlaylist) {
    return (
      <div className="space-y-6 px-8 pb-20">
        {/* Simulate loading channel cards */}
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="flex gap-4">
            <Skeleton className="w-16 h-16 rounded-lg bg-neutral-800" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4 bg-neutral-800" />
              <Skeleton className="h-3 w-1/2 bg-neutral-800" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="text-center py-20">
      <Skeleton className="h-6 w-48 mx-auto mb-4 bg-neutral-800" />
      <Skeleton className="h-4 w-64 mx-auto bg-neutral-800" />
    </div>
  );
};

export default FavoritesLoadingState;

