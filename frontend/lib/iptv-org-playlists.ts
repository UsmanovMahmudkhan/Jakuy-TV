'use client';

export interface IptvOrgPlaylist {
  id: string;
  name: string;
  url: string;
  category: string;
  channelCount?: number;
  type: 'category' | 'language' | 'country' | 'region';
}

export interface IptvOrgPlaylistGroup {
  name: string;
  playlists: IptvOrgPlaylist[];
}

export const parseIptvOrgPlaylists = (content: string): IptvOrgPlaylistGroup[] => {
  const groups: IptvOrgPlaylistGroup[] = [];

  const sections = content.split('### ');

  for (const section of sections) {
    if (section.includes('Grouped by category')) {
      const categoryPlaylists = parseCategorySection(section);
      if (categoryPlaylists.length > 0) {
        groups.push({
          name: 'Categories',
          playlists: categoryPlaylists
        });
      }
    } else if (section.includes('Grouped by language')) {
      const languagePlaylists = parseLanguageSection(section);
      if (languagePlaylists.length > 0) {
        groups.push({
          name: 'Languages',
          playlists: languagePlaylists
        });
      }
    } else if (section.includes('Grouped by broadcast area')) {
      const countryPlaylists = parseCountrySection(section);
      if (countryPlaylists.length > 0) {
        groups.push({
          name: 'Countries',
          playlists: countryPlaylists
        });
      }
    }
  }

  return groups;
};

const parseCategorySection = (content: string): IptvOrgPlaylist[] => {
  const playlists: IptvOrgPlaylist[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('<code>https://iptv-org.github.io/iptv/categories/') && line.includes('.m3u</code>')) {
      const urlMatch = line.match(/<code>(https:\/\/iptv-org\.github\.io\/iptv\/categories\/[^<]+)<\/code>/);
      const nameMatch = line.match(/<td>([^<]+)<\/td>/);

      if (urlMatch && nameMatch) {
        const url = urlMatch[1];
        const name = nameMatch[1].trim();

        let channelCount: number | undefined;
        const countMatch = line.match(/<td align="right">(\d+)<\/td>/);
        if (countMatch) {
          channelCount = parseInt(countMatch[1]);
        }

        playlists.push({
          id: `category-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name: name,
          url: url,
          category: 'Category',
          channelCount,
          type: 'category'
        });
      }
    }
  }

  return playlists;
};

// Parse language section
const parseLanguageSection = (content: string): IptvOrgPlaylist[] => {
  const playlists: IptvOrgPlaylist[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('<code>https://iptv-org.github.io/iptv/languages/') && line.includes('.m3u</code>')) {
      const urlMatch = line.match(/<code>(https:\/\/iptv-org\.github\.io\/iptv\/languages\/[^<]+)<\/code>/);
      const nameMatch = line.match(/<td[^>]*>([^<]+)<\/td>/);

      if (urlMatch && nameMatch) {
        const url = urlMatch[1];
        const name = nameMatch[1].trim();

        let channelCount: number | undefined;
        const countMatch = line.match(/<td align="right">(\d+)<\/td>/);
        if (countMatch) {
          channelCount = parseInt(countMatch[1]);
        }

        playlists.push({
          id: `language-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name: name,
          url: url,
          category: 'Language',
          channelCount,
          type: 'language'
        });
      }
    }
  }

  return playlists;
};

const parseCountrySection = (content: string): IptvOrgPlaylist[] => {
  const playlists: IptvOrgPlaylist[] = [];
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.includes('<code>https://iptv-org.github.io/iptv/countries/') && line.includes('.m3u</code>')) {
      const urlMatch = line.match(/<code>(https:\/\/iptv-org\.github\.io\/iptv\/countries\/[^<]+)<\/code>/);
      const nameMatch = line.match(/([A-Z][^<]+)<\/code>/);

      if (urlMatch && nameMatch) {
        const url = urlMatch[1];
        const name = nameMatch[1].trim();

        let channelCount: number | undefined;
        for (let j = Math.max(0, i - 5); j < i; j++) {
          const countLine = lines[j].trim();
          const countMatch = countLine.match(/<td align="right">(\d+)<\/td>/);
          if (countMatch) {
            channelCount = parseInt(countMatch[1]);
            break;
          }
        }

        playlists.push({
          id: `country-${name.toLowerCase().replace(/\s+/g, '-')}`,
          name: name,
          url: url,
          category: 'Country',
          channelCount,
          type: 'country'
        });
      }
    }
  }

  return playlists;
};

export const fetchIptvOrgPlaylists = async (): Promise<IptvOrgPlaylistGroup[]> => {
  try {
    const response = await fetch('https://raw.githubusercontent.com/iptv-org/iptv/master/PLAYLISTS.md');
    if (!response.ok) {
      throw new Error('Failed to fetch playlists from GitHub');
    }

    const content = await response.text();
    return parseIptvOrgPlaylists(content);
  } catch (error) {
    console.error('Error fetching GitHub playlists:', error);
    return [];
  }
};

export const searchPlaylists = (
  groups: IptvOrgPlaylistGroup[],
  query: string,
  type?: IptvOrgPlaylist['type']
): IptvOrgPlaylist[] => {
  const allPlaylists = groups.flatMap(group => group.playlists);

  return allPlaylists.filter(playlist => {
    const matchesQuery = !query ||
      playlist.name.toLowerCase().includes(query.toLowerCase()) ||
      playlist.category.toLowerCase().includes(query.toLowerCase());

    const matchesType = !type || playlist.type === type;

    return matchesQuery && matchesType;
  });
};

export const getPlaylistsByType = (
  groups: IptvOrgPlaylistGroup[],
  type: IptvOrgPlaylist['type']
): IptvOrgPlaylist[] => {
  return groups.flatMap(group => group.playlists).filter(playlist => playlist.type === type);
};