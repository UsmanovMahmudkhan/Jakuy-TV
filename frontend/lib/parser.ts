import { Channel, Playlist } from "@/types";
import { v4 as uuidv4 } from 'uuid';

export const parseM3U = (content: string): Playlist => {
  const lines = content.split(/\r?\n/);
  const channels: Channel[] = [];
  const groups: Set<string> = new Set();

  let currentChannel: Partial<Channel> = {};

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    if (line.startsWith("#EXTINF:")) {
      const info = line.substring(8);
      const durationCommaIndex = info.indexOf(",");
      let displayName = "";
      let attributes = "";

      if (durationCommaIndex !== -1) {
        attributes = info.substring(0, durationCommaIndex);
        displayName = info.substring(durationCommaIndex + 1).trim();
      } else {
        attributes = info;
      }

      const getAttr = (attr: string) => {
        const regex = new RegExp(`${attr}="([^"]*)"`, "i");
        const match = attributes.match(regex);
        return match ? match[1] : undefined;
      };

      currentChannel = {
        id: uuidv4(),
        tvgId: getAttr("tvg-id"),
        tvgName: getAttr("tvg-name"),
        logo: getAttr("tvg-logo"),
        groupTitle: getAttr("group-title") || "Uncategorized",
        name: displayName,
      };

      if (currentChannel.groupTitle) {
        groups.add(currentChannel.groupTitle);
      }
    } else if (!line.startsWith("#")) {
      if (currentChannel.id) {
        currentChannel.url = line;
        channels.push(currentChannel as Channel);
        currentChannel = {};
      }
    }
  }

  return {
    channels: channels,
    groups: Array.from(groups).sort(),
  };
};

export const parseQuality = (name: string): { baseName: string; quality: string | null } => {
  const qualityMatch = name.match(/\(([^)]+)\)$/);
  if (qualityMatch) {
    const quality = qualityMatch[1];
    const baseName = name.replace(`(${quality})`, "").trim();
    return { baseName, quality };
  }
  return { baseName: name, quality: null };
};

export const getUniqueChannelsByBaseName = (channels: Channel[]): Channel[] => {
  const uniqueMap = new Map<string, Channel>();
  
  channels.forEach(channel => {
    const { baseName } = parseQuality(channel.name);
    if (!uniqueMap.has(baseName)) {
      uniqueMap.set(baseName, {
        ...channel,
        baseName
      });
    }
  });

  return Array.from(uniqueMap.values());
};
