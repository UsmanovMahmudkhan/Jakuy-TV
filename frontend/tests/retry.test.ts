import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchWithRetry } from '@/lib/api';

const jsonResponse = (status: number, body: unknown = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Advances fake timers in steps until the pending promise settles, so the
// exponential-backoff sleeps resolve without waiting in real time. The promise's
// outcome is fully captured here (no dangling rejection) and re-surfaced after.
const settle = async <T>(promise: Promise<T>): Promise<T> => {
  let outcome: { value: T } | { error: unknown } | undefined;
  const tracked = promise.then(
    value => {
      outcome = { value };
    },
    error => {
      outcome = { error };
    }
  );
  while (!outcome) {
    await vi.advanceTimersByTimeAsync(1_000);
  }
  await tracked;
  if ('error' in outcome) {
    throw outcome.error;
  }
  return outcome.value;
};

describe('fetchWithRetry', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('retries a transient 503 and resolves once the backend responds', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(jsonResponse(503))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await settle(fetchWithRetry('https://api.test/health'));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('retries a network/abort error and resolves on recovery', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new DOMException('The operation was aborted', 'AbortError'))
      .mockResolvedValueOnce(jsonResponse(200));
    vi.stubGlobal('fetch', fetchMock);

    const response = await settle(fetchWithRetry('https://api.test/health'));

    expect(response.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('gives up and throws after the retry budget on persistent 503', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(503));
    vi.stubGlobal('fetch', fetchMock);

    await expect(settle(fetchWithRetry('https://api.test/health'))).rejects.toThrow(/503/);
    // Multiple attempts were made before giving up within the budget.
    expect(fetchMock.mock.calls.length).toBeGreaterThan(1);
  });

  it('does not retry a non-gateway error (e.g. 404)', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(404));
    vi.stubGlobal('fetch', fetchMock);

    const response = await settle(fetchWithRetry('https://api.test/missing'));

    expect(response.status).toBe(404);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
