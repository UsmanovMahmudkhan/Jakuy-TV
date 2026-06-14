import { Channel, EpgData, Playlist } from "@/types";
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PlaylistSettings {
  favorites: string[];
  recentlyWatched: string[];
  playbackProgress: Record<string, { currentTime: number; duration: number; timestamp: number }>;
  savedEpgUrl: string | null;
  lastAccessed: number;
}

interface PlayerState {
  playlist: Channel[];
  groups: string[];
  favorites: string[];
  recentlyWatched: string[];
  savedPlaylistUrl: string | null;
  savedPlaylistName: string | null;
  currentPlaylistHash: string | null;
  playlistsSettings: Record<string, PlaylistSettings>;
  savedEpgUrl: string | null;
  epgData: EpgData | null;
  isLoadingEpg: boolean;
  activeChannel: Channel | null;
  activeGroup: string;
  searchQuery: string;
  isSidebarOpen: boolean;
  isHydrated: boolean;
  volume: number;
  isMuted: boolean;
  playbackProgress: Record<string, { currentTime: number; duration: number; timestamp: number }>;

  setPlaylist: (playlist: Playlist) => void;
  toggleFavorite: (channelName: string) => void;
  addToRecentlyWatched: (channelName: string) => void;
  updatePlaybackProgress: (channelName: string, currentTime: number, duration: number) => void;
  savePlaylist: (url: string, name: string) => void;
  clearSavedPlaylist: () => void;
  setActiveChannel: (channel: Channel | null) => void;
  setActiveGroup: (group: string) => void;
  setSearchQuery: (query: string) => void;
  toggleSidebar: () => void;
  resetSession: () => void;
  logout: () => void;
  saveEpgUrl: (url: string | null) => void;
  setEpgData: (data: EpgData | null) => void;
  setIsLoadingEpg: (loading: boolean) => void;
  setVolume: (volume: number) => void;
  setIsMuted: (muted: boolean) => void;

  hasSavedPlaylist: () => boolean;
  hasFavorites: () => boolean;
  hasRecentlyWatched: () => boolean;
  isFavorite: (channelName: string) => boolean;
  getSavedPlaylistInfo: () => { url: string | null; name: string | null };
  getRecentlyWatchedCount: () => number;
  getFavoritesCount: () => number;
  getEpgUrl: () => string | null;
  getEpgData: () => EpgData | null;
}

const getHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(36);
};

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      playlist: [],
      groups: [],
      favorites: [],
      recentlyWatched: [],
      savedPlaylistUrl: null,
      savedPlaylistName: null,
      currentPlaylistHash: null,
      playlistsSettings: {},
      savedEpgUrl: null,
      epgData: null,
      isLoadingEpg: false,
      activeChannel: null,
      activeGroup: "All",
      searchQuery: "",
      isSidebarOpen: true,
      isHydrated: false,
      volume: 1,
      isMuted: false,
      playbackProgress: {},

      setPlaylist: (data: Playlist) => set({ playlist: data.channels, groups: data.groups, activeGroup: "All" }),

      toggleFavorite: (channelName: string) =>
        set(state => {
          const newFavorites = state.favorites.includes(channelName)
            ? state.favorites.filter(name => name !== channelName)
            : [...state.favorites, channelName];

          const newState = { favorites: newFavorites };

          if (state.currentPlaylistHash) {
            const settings = state.playlistsSettings[state.currentPlaylistHash];
            if (settings) {
              return {
                ...newState,
                playlistsSettings: {
                  ...state.playlistsSettings,
                  [state.currentPlaylistHash]: {
                    ...settings,
                    favorites: newFavorites,
                  },
                },
              };
            }
          }

          return newState;
        }),

      addToRecentlyWatched: (channelName: string) =>
        set(state => {
          const filtered = state.recentlyWatched.filter(name => name !== channelName);
          const updated = [channelName, ...filtered].slice(0, 20);
          const newState = { recentlyWatched: updated };

          if (state.currentPlaylistHash) {
            const settings = state.playlistsSettings[state.currentPlaylistHash];
            if (settings) {
              return {
                ...newState,
                playlistsSettings: {
                  ...state.playlistsSettings,
                  [state.currentPlaylistHash]: {
                    ...settings,
                    recentlyWatched: updated,
                  },
                },
              };
            }
          }

          return newState;
        }),

      updatePlaybackProgress: (channelName, currentTime, duration) =>
        set(state => {
          const newProgress = {
            ...state.playbackProgress,
            [channelName]: {
              currentTime,
              duration,
              timestamp: Date.now(),
            },
          };
          const newState = { playbackProgress: newProgress };

          if (state.currentPlaylistHash) {
            const settings = state.playlistsSettings[state.currentPlaylistHash];
            if (settings) {
              return {
                ...newState,
                playlistsSettings: {
                  ...state.playlistsSettings,
                  [state.currentPlaylistHash]: {
                    ...settings,
                    playbackProgress: newProgress,
                  },
                },
              };
            }
          }

          return newState;
        }),

      savePlaylist: (url: string, name: string) =>
        set(state => {
          const hash = getHash(url);
          const settings = state.playlistsSettings[hash] || {
            favorites: [],
            recentlyWatched: [],
            playbackProgress: {},
            savedEpgUrl: null,
            lastAccessed: Date.now(),
          };

          const updatedSettings = { ...settings, lastAccessed: Date.now() };
          const newPlaylistsSettings = { ...state.playlistsSettings, [hash]: updatedSettings };

          const sortedHashes = Object.keys(newPlaylistsSettings).sort(
            (a, b) => newPlaylistsSettings[b].lastAccessed - newPlaylistsSettings[a].lastAccessed
          );

          const prunedPlaylistsSettings: Record<string, PlaylistSettings> = {};
          sortedHashes.slice(0, 10).forEach(h => {
            prunedPlaylistsSettings[h] = newPlaylistsSettings[h];
          });

          return {
            savedPlaylistUrl: url,
            savedPlaylistName: name,
            currentPlaylistHash: hash,
            playlistsSettings: prunedPlaylistsSettings,
            favorites: updatedSettings.favorites,
            recentlyWatched: updatedSettings.recentlyWatched,
            playbackProgress: updatedSettings.playbackProgress,
            savedEpgUrl: updatedSettings.savedEpgUrl,
          };
        }),

      saveEpgUrl: (url: string | null) =>
        set(state => {
          const newState = { savedEpgUrl: url };

          if (state.currentPlaylistHash) {
            const settings = state.playlistsSettings[state.currentPlaylistHash];
            if (settings) {
              return {
                ...newState,
                playlistsSettings: {
                  ...state.playlistsSettings,
                  [state.currentPlaylistHash]: {
                    ...settings,
                    savedEpgUrl: url,
                  },
                },
              };
            }
          }

          return newState;
        }),

      setEpgData: (data: EpgData | null) => set({ epgData: data, isLoadingEpg: false }),

      setIsLoadingEpg: (loading: boolean) => set({ isLoadingEpg: loading }),

      setVolume: (volume: number) => set({ volume }),

      setIsMuted: (muted: boolean) => set({ isMuted: muted }),

      clearSavedPlaylist: () =>
        set({ savedPlaylistUrl: null, savedPlaylistName: null, currentPlaylistHash: null, savedEpgUrl: null, epgData: null, recentlyWatched: [], favorites: [], playbackProgress: {} }),

      setActiveChannel: channel =>
        set(state => {
          if (channel) {
            const baseName = channel.baseName || channel.name;
            const filtered = state.recentlyWatched.filter(name => name !== baseName);
            const updated = [baseName, ...filtered].slice(0, 20);
            
            const newState = { activeChannel: channel, recentlyWatched: updated };

            if (state.currentPlaylistHash) {
              const settings = state.playlistsSettings[state.currentPlaylistHash];
              if (settings) {
                return {
                  ...newState,
                  playlistsSettings: {
                    ...state.playlistsSettings,
                    [state.currentPlaylistHash]: {
                      ...settings,
                      recentlyWatched: updated,
                    },
                  },
                };
              }
            }

            return newState;
          }

          return { activeChannel: channel };
        }),
      setActiveGroup: group => set({ activeGroup: group }),
      setSearchQuery: query => set({ searchQuery: query }),

      toggleSidebar: () => set(state => ({ isSidebarOpen: !state.isSidebarOpen })),

      resetSession: () => set({ playlist: [], groups: [], activeChannel: null, activeGroup: "All", searchQuery: "" }),

      logout: () => {
        set({
          playlist: [],
          groups: [],
          favorites: [],
          recentlyWatched: [],
          savedPlaylistUrl: null,
          savedPlaylistName: null,
          currentPlaylistHash: null,
          savedEpgUrl: null,
          epgData: null,
          activeChannel: null,
          activeGroup: "All",
          searchQuery: "",
          isSidebarOpen: true,
          playbackProgress: {},
        });
      },

      hasSavedPlaylist: () => get().savedPlaylistUrl !== null,

      hasFavorites: () => get().favorites.length > 0,

      hasRecentlyWatched: () => get().recentlyWatched.length > 0,

      isFavorite: (channelName: string) => get().favorites.includes(channelName),

      getSavedPlaylistInfo: () => ({
        url: get().savedPlaylistUrl,
        name: get().savedPlaylistName,
      }),

      getRecentlyWatchedCount: () => get().recentlyWatched.length,

      getFavoritesCount: () => get().favorites.length,

      getEpgUrl: () => get().savedEpgUrl,

      getEpgData: () => get().epgData,
    }),
    {
      name: "jakuy-tv-storage",
      partialize: state => ({
        playlistsSettings: state.playlistsSettings,
        savedPlaylistUrl: state.savedPlaylistUrl,
        savedPlaylistName: state.savedPlaylistName,
        currentPlaylistHash: state.currentPlaylistHash,
        savedEpgUrl: state.savedEpgUrl,
        favorites: state.favorites,
        recentlyWatched: state.recentlyWatched,
        playbackProgress: state.playbackProgress,
        volume: state.volume,
        isMuted: state.isMuted,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.isHydrated = true;
        }
      },
    }
  )
);
