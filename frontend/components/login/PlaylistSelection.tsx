import { Button } from "@/components/ui/button";
import { useLoginContext } from "@/contexts/LoginContext";
import { useIptvOrgPlaylists } from "@/hooks/useIptvOrgPlaylists";
import { PredefinedPlaylist, predefinedPlaylists } from "@/types/playlist";
import { Globe, Star } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CategoryFilter from "./CategoryFilter";
import { PaginationControls } from "./PaginationControls";
import { PlaylistFooter } from "./PlaylistFooter";
import { PlaylistList } from "./PlaylistList";
import { SearchFilterBar } from "./SearchFilterBar";
import { TypeFilter } from "./TypeFilter";

const PlaylistSelection = () => {
  const { isLoading, loadPredefinedPlaylist } = useLoginContext();
  const {
    groups: githubGroups,
    filteredPlaylists: githubPlaylists,
    isLoading: githubLoading,
    error: githubError,
    searchQuery,
    setSearchQuery,
    selectedType,
    setSelectedType,
    refresh: refreshGitHubPlaylists,
  } = useIptvOrgPlaylists();

  const [selectedPlaylist, setSelectedPlaylist] = useState<PredefinedPlaylist | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'featured' | 'github'>('featured');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQueryFeatured, setSearchQueryFeatured] = useState('');
  const [currentPageFeatured, setCurrentPageFeatured] = useState(1);
  const playlistsPerPage = 50;

  // Extract unique categories from predefined playlists
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(predefinedPlaylists.map(playlist => playlist.category))];
    return uniqueCategories.sort();
  }, []);

  // Filter playlists based on selected category
  const filteredPredefinedPlaylists = useMemo(() => {
    if (!selectedCategory) {
      return predefinedPlaylists;
    }
    return predefinedPlaylists.filter(playlist => playlist.category === selectedCategory);
  }, [selectedCategory]);

  // Search filter for featured playlists
  const searchedPredefinedPlaylists = useMemo(() => {
    if (!searchQueryFeatured) return filteredPredefinedPlaylists;
    return filteredPredefinedPlaylists.filter(playlist =>
      playlist.name.toLowerCase().includes(searchQueryFeatured.toLowerCase()) ||
      playlist.description.toLowerCase().includes(searchQueryFeatured.toLowerCase())
    );
  }, [filteredPredefinedPlaylists, searchQueryFeatured]);

  const handlePlaylistSelect = async (playlist: PredefinedPlaylist) => {
    setSelectedPlaylist(playlist);
    await loadPredefinedPlaylist(playlist);
  };

  const handleGitHubPlaylistSelect = async (playlist: PredefinedPlaylist) => {
    setSelectedPlaylist(playlist);
    await loadPredefinedPlaylist(playlist);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedType]);

  // Reset page when featured filters change
  useEffect(() => {
    setCurrentPageFeatured(1);
  }, [searchQueryFeatured, selectedCategory]);

  // Total count of all playlists (unfiltered)
  const totalPlaylistCount = useMemo(() => {
    return githubGroups.reduce((total, group) => total + group.playlists.length, 0);
  }, [githubGroups]);

  // Count playlists by type for filter buttons (from all playlists, not filtered)
  const typeCounts = useMemo(() => {
    const counts = {
      category: 0,
      language: 0,
      country: 0,
      region: 0,
    };

    // Get all playlists from groups (unfiltered)
    githubGroups.forEach(group => {
      group.playlists.forEach(playlist => {
        counts[playlist.type]++;
      });
    });

    return counts;
  }, [githubGroups]);

  // Pagination for GitHub playlists
  const totalPages = Math.ceil(githubPlaylists.length / playlistsPerPage);
  const startIndex = (currentPage - 1) * playlistsPerPage;
  const endIndex = startIndex + playlistsPerPage;
  const currentPlaylists = githubPlaylists.slice(startIndex, endIndex);

  // Pagination for featured playlists
  const totalPagesFeatured = Math.ceil(searchedPredefinedPlaylists.length / playlistsPerPage);
  const startIndexFeatured = (currentPageFeatured - 1) * playlistsPerPage;
  const endIndexFeatured = startIndexFeatured + playlistsPerPage;
  const currentPredefinedPlaylists = searchedPredefinedPlaylists.slice(startIndexFeatured, endIndexFeatured);

  return (
    <div className="flex flex-col gap-4 w-full h-full">
      {/* Tab Navigation */}
      <div className="flex gap-2 shrink-0">
        <Button
          variant={activeTab === 'featured' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('featured')}
          className="flex items-center gap-2"
        >
          <Star className="w-4 h-4" />
          Featured
        </Button>
        <Button
          variant={activeTab === 'github' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveTab('github')}
          className="flex items-center gap-2"
        >
          <Globe className="w-4 h-4" />
          IPTV-ORG ({githubPlaylists.length})
        </Button>
      </div>

      {activeTab === 'featured' ? (
        <>
          <SearchFilterBar
            searchQuery={searchQueryFeatured}
            onSearchChange={setSearchQueryFeatured}
            showRefresh={false}
          />

          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />

          <PlaylistList
            playlists={currentPredefinedPlaylists}
            selectedPlaylistId={selectedPlaylist?.id}
            isLoading={isLoading}
            onSelect={handlePlaylistSelect}
            type="predefined"
            emptyMessage="No playlists found in this category."
          />

          <PaginationControls
            currentPage={currentPageFeatured}
            totalPages={totalPagesFeatured}
            onPageChange={setCurrentPageFeatured}
          />

          <PlaylistFooter
            totalCount={searchedPredefinedPlaylists.length}
            currentRange={{
              start: startIndexFeatured + 1,
              end: Math.min(endIndexFeatured, searchedPredefinedPlaylists.length),
            }}
            searchQuery={searchQueryFeatured || undefined}
            selectedCategory={selectedCategory || undefined}
            itemName="playlist"
          />
        </>
      ) : (
        <>
          <SearchFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRefresh={refreshGitHubPlaylists}
            isRefreshing={githubLoading}
            showRefresh={true}
          />

          <TypeFilter
            selectedType={selectedType}
            onTypeSelect={setSelectedType}
            totalCount={totalPlaylistCount}
            categoryCount={typeCounts.category}
            languageCount={typeCounts.language}
            countryCount={typeCounts.country}
          />

          <PlaylistList
            playlists={currentPlaylists}
            selectedPlaylistId={selectedPlaylist?.id}
            isLoading={githubLoading || isLoading}
            error={githubError}
            onSelect={handleGitHubPlaylistSelect}
            type="github"
            emptyMessage="No playlists found."
            loadingMessage="Loading playlists from GitHub..."
            errorMessage="Error loading playlists"
          />

          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          <PlaylistFooter
            totalCount={githubPlaylists.length}
            currentRange={{
              start: startIndex + 1,
              end: Math.min(endIndex, githubPlaylists.length),
            }}
            searchQuery={searchQuery || undefined}
            selectedType={selectedType || undefined}
            itemName="playlist"
          />
        </>
      )}
    </div>
  );
};

export default PlaylistSelection;
