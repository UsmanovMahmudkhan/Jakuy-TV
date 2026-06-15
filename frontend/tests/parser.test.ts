import { describe, expect, it } from 'vitest';
import { getUniqueChannelsByBaseName, parseM3U, parseQuality } from '@/lib/parser';
import { Channel } from '@/types';

describe('parseM3U', () => {
  it('parses a standard entry with all attributes', () => {
    const content = [
      '#EXTM3U',
      '#EXTINF:-1 tvg-id="Uzbekistan24.uz" tvg-name="Uzbekistan 24" tvg-logo="https://example.com/logo.png" group-title="News",Uzbekistan 24',
      'https://example.com/live.m3u8',
    ].join('\n');

    const playlist = parseM3U(content);

    expect(playlist.channels).toHaveLength(1);
    const channel = playlist.channels[0];
    expect(channel.tvgId).toBe('Uzbekistan24.uz');
    expect(channel.logo).toBe('https://example.com/logo.png');
    expect(channel.groupTitle).toBe('News');
    expect(channel.name).toBe('Uzbekistan 24');
    expect(channel.url).toBe('https://example.com/live.m3u8');
    expect(channel.id).toBeTruthy();
    expect(playlist.groups).toEqual(['News']);
  });

  it('defaults group to Uncategorized when missing', () => {
    const content = '#EXTINF:-1,No Group Channel\nhttps://example.com/x.m3u8';
    const playlist = parseM3U(content);
    expect(playlist.channels[0].groupTitle).toBe('Uncategorized');
    expect(playlist.groups).toEqual(['Uncategorized']);
  });

  it('skips an #EXTINF line that has no following URL', () => {
    const content = '#EXTINF:-1 group-title="News",Dangling';
    const playlist = parseM3U(content);
    expect(playlist.channels).toHaveLength(0);
  });

  it('handles CRLF line endings and blank lines', () => {
    const content = '#EXTINF:-1,Chan A\r\nhttps://a.example/x.m3u8\r\n\r\n#EXTINF:-1,Chan B\r\nhttps://b.example/y.m3u8';
    const playlist = parseM3U(content);
    expect(playlist.channels.map(c => c.name)).toEqual(['Chan A', 'Chan B']);
  });

  it('returns empty playlist for empty input', () => {
    expect(parseM3U('').channels).toHaveLength(0);
    expect(parseM3U('').groups).toHaveLength(0);
  });

  it('does not crash on garbage input', () => {
    const playlist = parseM3U('just some random text\nwith no directives');
    expect(playlist.channels).toHaveLength(0);
  });
});

describe('parseQuality', () => {
  it('extracts a trailing parenthetical quality tag', () => {
    expect(parseQuality('Sevimli (HD)')).toEqual({ baseName: 'Sevimli', quality: 'HD' });
  });

  it('returns null quality when there is no tag', () => {
    expect(parseQuality('Sevimli')).toEqual({ baseName: 'Sevimli', quality: null });
  });
});

describe('getUniqueChannelsByBaseName', () => {
  it('keeps only the first channel per base name', () => {
    const channels: Channel[] = [
      { id: '1', name: 'Sevimli (HD)', url: 'a' },
      { id: '2', name: 'Sevimli (SD)', url: 'b' },
      { id: '3', name: 'Milliy', url: 'c' },
    ];
    const unique = getUniqueChannelsByBaseName(channels);
    expect(unique).toHaveLength(2);
    expect(unique.map(c => c.baseName)).toEqual(['Sevimli', 'Milliy']);
    expect(unique[0].id).toBe('1');
  });

  it('returns an empty array for empty input', () => {
    expect(getUniqueChannelsByBaseName([])).toHaveLength(0);
  });
});
