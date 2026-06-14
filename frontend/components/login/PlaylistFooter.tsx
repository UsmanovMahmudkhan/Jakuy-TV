interface PlaylistFooterProps {
  totalCount: number;
  currentRange?: {
    start: number;
    end: number;
  };
  searchQuery?: string;
  selectedType?: string;
  selectedCategory?: string;
  itemName?: string;
}

export const PlaylistFooter = ({
  totalCount,
  currentRange,
  searchQuery,
  selectedType,
  selectedCategory,
  itemName = "playlist",
}: PlaylistFooterProps) => {
  const displayCount = currentRange
    ? `${currentRange.start}-${currentRange.end} of ${totalCount}`
    : totalCount;

  const pluralItemName = totalCount !== 1 ? `${itemName}s` : itemName;

  return (
    <div className="text-xs text-neutral-500 text-center shrink-0 pb-2">
      Showing {displayCount} {pluralItemName}
      {searchQuery && ` matching "${searchQuery}"`}
      {selectedType && ` in ${selectedType}s`}
      {selectedCategory && ` in ${selectedCategory}`}
    </div>
  );
};