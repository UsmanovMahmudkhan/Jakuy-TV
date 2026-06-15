import { describe, expect, it } from 'vitest';
import { BackendChannel, buildPlaylist, mapBackendChannel } from '@/lib/api';

const backendChannel = (overrides: Partial<BackendChannel> = {}): BackendChannel => ({
  id: 1,
  name: 'Uzbekistan 24',
  streamUrl: 'https://example.com/live.m3u8',
  online: true,
  ...overrides,
});

describe('mapBackendChannel', () => {
  it('maps a backend channel to the frontend model', () => {
    const mapped = mapBackendChannel(backendChannel({ id: 42, category: 'News', logoUrl: 'https://x/logo.png' }));
    expect(mapped.id).toBe('42');
    expect(mapped.name).toBe('Uzbekistan 24');
    expect(mapped.url).toBe('https://example.com/live.m3u8');
    expect(mapped.groupTitle).toBe('News');
    expect(mapped.logo).toBe('https://x/logo.png');
    expect(mapped.online).toBe(true);
  });

  it('falls back to Uncategorized when category is missing', () => {
    expect(mapBackendChannel(backendChannel({ category: undefined })).groupTitle).toBe('Uncategorized');
  });
});

describe('buildPlaylist', () => {
  it('produces sorted, de-duplicated groups', () => {
    const playlist = buildPlaylist([
      backendChannel({ id: 1, category: 'News' }),
      backendChannel({ id: 2, category: 'Kids' }),
      backendChannel({ id: 3, category: 'News' }),
    ]);
    expect(playlist.channels).toHaveLength(3);
    expect(playlist.groups).toEqual(['Kids', 'News']);
  });

  it('handles an empty channel list', () => {
    const playlist = buildPlaylist([]);
    expect(playlist.channels).toHaveLength(0);
    expect(playlist.groups).toHaveLength(0);
  });
});
