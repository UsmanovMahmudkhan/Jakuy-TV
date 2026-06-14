export interface PredefinedPlaylist {
  id: string;
  name: string;
  description: string;
  url: string;
  epgUrl?: string;
  category: string;
  legal?: boolean;
}

export const predefinedPlaylists: PredefinedPlaylist[] = [
  {
    id: "m3upt",
    name: "M3UPT",
    description: "Free and legal IPTV playlist in M3U format with TV and radio stations in Portuguese. Public and official streams only.",
    url: "https://m3upt.com/iptv",
    epgUrl: "https://m3upt.com/epg",
    category: "Portuguese",
    legal: true,
  },
];
