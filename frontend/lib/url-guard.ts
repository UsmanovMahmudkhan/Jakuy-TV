import { lookup } from 'node:dns/promises';
import { isIP } from 'node:net';

export class UrlGuardError extends Error {}

const BLOCKED_HOSTNAMES = new Set(['localhost', 'ip6-localhost', 'ip6-loopback']);

const isPrivateIPv4 = (ip: string): boolean => {
  const parts = ip.split('.').map(Number);
  if (parts.length !== 4 || parts.some(p => Number.isNaN(p) || p < 0 || p > 255)) {
    return true;
  }
  const [a, b] = parts;
  if (a === 10) return true;
  if (a === 127) return true;
  if (a === 0) return true;
  if (a === 169 && b === 254) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a >= 224) return true;
  return false;
};

const isPrivateIPv6 = (ip: string): boolean => {
  const normalized = ip.toLowerCase().replace(/^\[|\]$/g, '');
  if (normalized === '::1' || normalized === '::') return true;
  if (normalized.startsWith('fe80') || normalized.startsWith('fc') || normalized.startsWith('fd')) {
    return true;
  }

  const dottedMapped = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
  if (dottedMapped) return isPrivateIPv4(dottedMapped[1]);

  const hexMapped = normalized.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/);
  if (hexMapped) {
    const high = parseInt(hexMapped[1], 16);
    const low = parseInt(hexMapped[2], 16);
    const ipv4 = `${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`;
    return isPrivateIPv4(ipv4);
  }

  return false;
};

const isBlockedAddress = (ip: string): boolean => {
  const family = isIP(ip);
  if (family === 4) return isPrivateIPv4(ip);
  if (family === 6) return isPrivateIPv6(ip);
  return true;
};

export async function assertPublicHttpUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    throw new UrlGuardError('Invalid URL');
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UrlGuardError('Only HTTP and HTTPS URLs are allowed');
  }

  const hostname = url.hostname.replace(/^\[|\]$/g, '').toLowerCase();
  if (!hostname || BLOCKED_HOSTNAMES.has(hostname) || hostname.endsWith('.localhost')) {
    throw new UrlGuardError('Target host is not allowed');
  }

  if (isIP(hostname)) {
    if (isBlockedAddress(hostname)) {
      throw new UrlGuardError('Target host is not allowed');
    }
    return url;
  }

  let resolved: { address: string }[];
  try {
    resolved = await lookup(hostname, { all: true });
  } catch {
    throw new UrlGuardError('Target host could not be resolved');
  }

  if (resolved.length === 0 || resolved.some(record => isBlockedAddress(record.address))) {
    throw new UrlGuardError('Target host is not allowed');
  }

  return url;
}
