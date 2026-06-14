
export interface Channel {
  id: string;
  tvgId?: string;
  tvgName?: string;
  groupTitle?: string;
  logo?: string;
  name: string;
  url: string;
  baseName?: string;
  quality?: string | null;
  online?: boolean;
}

export interface Playlist {
  channels: Channel[];
  groups: string[];
}
