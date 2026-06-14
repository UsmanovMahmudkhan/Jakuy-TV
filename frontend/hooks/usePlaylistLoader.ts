'use client';

import { fetchPlaylist } from "@/app/actions";
import { fetchEpg } from "@/lib/epg";
import { parseM3U } from "@/lib/parser";
import { usePlayerStore } from "@/store/useStore";
import { PredefinedPlaylist } from "@/types/playlist";
import { useState } from "react";

interface UsePlaylistLoaderReturn {
  input: string;
  setInput: (value: string) => void;
  epgInput: string;
  setEpgInput: (value: string) => void;
  isLoading: boolean;
  error: string;
  handleLoad: () => Promise<void>;
  handleFileUpload: () => void;
  loadPredefinedPlaylist: (playlist: PredefinedPlaylist) => Promise<void>;
}

const hashContent = (content: string): string => {
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString();
};

const usePlaylistLoader = (): UsePlaylistLoaderReturn => {
  const [input, setInput] = useState("");
  const [epgInput, setEpgInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { setPlaylist, savePlaylist, saveEpgUrl, setEpgData, setIsLoadingEpg } = usePlayerStore();

  const saveEpgIfProvided = async () => {
    if (epgInput.trim()) {
      saveEpgUrl(epgInput.trim());
      try {
        setIsLoadingEpg(true);
        const epgResult = await fetchEpg(epgInput.trim());
        if (epgResult.success && epgResult.data) {
          setEpgData(epgResult.data);
        } else {
          setIsLoadingEpg(false);
        }
      } catch (err) {
        console.error("Failed to load EPG data:", err);
        setIsLoadingEpg(false);
      }
    }
  };

  const handleLoad = async () => {
    setIsLoading(true);
    setError("");

    try {
      let content = input;
      let playlistUrl = input;
      let playlistName = "";

      if (input.startsWith("http")) {
        playlistUrl = input;
        playlistName = new URL(input).hostname;
        const result = await fetchPlaylist(input);
        if (!result.success) {
          throw new Error(result.error);
        }
        content = result.data || "";
      } else {
        const contentHash = hashContent(content);
        playlistUrl = `uploaded-${contentHash}`;
        playlistName = "Uploaded Playlist";
      }

      if (!content.includes("#EXTINF")) {
        throw new Error("Invalid M3U format. Missing #EXTINF directives.");
      }

      const parsed = parseM3U(content);
      if (parsed.channels.length === 0) {
        throw new Error("No channels found in playlist.");
      }

      setPlaylist(parsed);
      savePlaylist(playlistUrl, playlistName);
      await saveEpgIfProvided();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const loadPredefinedPlaylist = async (playlist: PredefinedPlaylist) => {
    setIsLoading(true);
    setError("");

    try {
      const result = await fetchPlaylist(playlist.url);
      if (!result.success) {
        throw new Error(result.error);
      }

      const content = result.data || "";
      if (!content.includes("#EXTINF")) {
        throw new Error("Invalid M3U format. Missing #EXTINF directives.");
      }

      const parsed = parseM3U(content);
      if (parsed.channels.length === 0) {
        throw new Error("No channels found in playlist.");
      }

      setPlaylist(parsed);
      savePlaylist(playlist.url, playlist.name);

      if (playlist.epgUrl) {
        setEpgInput(playlist.epgUrl);
        await saveEpgIfProvided();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load playlist");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = () => {
    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.accept = ".m3u,.m3u8";
    inputElement.onchange = e => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          setInput(e.target?.result as string);
        };
        reader.readAsText(file);
      }
    };
    inputElement.click();
  };

  return {
    input,
    setInput,
    epgInput,
    setEpgInput,
    isLoading,
    error,
    handleLoad,
    handleFileUpload,
    loadPredefinedPlaylist,
  };
};

export default usePlaylistLoader;