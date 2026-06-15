import { describe, expect, it } from 'vitest';
import { assertPublicHttpUrl, UrlGuardError } from '@/lib/url-guard';

const expectRejected = async (url: string) => {
  await expect(assertPublicHttpUrl(url)).rejects.toBeInstanceOf(UrlGuardError);
};

describe('assertPublicHttpUrl', () => {
  it('accepts a public https URL with an IP literal', async () => {
    const url = await assertPublicHttpUrl('https://8.8.8.8/playlist.m3u8');
    expect(url.hostname).toBe('8.8.8.8');
  });

  it('rejects non-http protocols', async () => {
    await expectRejected('file:///etc/passwd');
    await expectRejected('ftp://example.com/x');
    await expectRejected('gopher://example.com');
  });

  it('rejects malformed URLs', async () => {
    await expectRejected('not a url');
    await expectRejected('');
  });

  it('rejects localhost and loopback', async () => {
    await expectRejected('http://localhost/admin');
    await expectRejected('http://127.0.0.1:8080/');
    await expectRejected('http://[::1]/');
    await expectRejected('http://service.localhost/');
  });

  it('rejects private IPv4 ranges', async () => {
    await expectRejected('http://10.0.0.5/');
    await expectRejected('http://192.168.1.1/');
    await expectRejected('http://172.16.0.1/');
    await expectRejected('http://172.31.255.255/');
  });

  it('rejects the cloud metadata endpoint', async () => {
    await expectRejected('http://169.254.169.254/latest/meta-data/');
  });

  it('rejects IPv4-mapped IPv6 loopback', async () => {
    await expectRejected('http://[::ffff:127.0.0.1]/');
  });
});
