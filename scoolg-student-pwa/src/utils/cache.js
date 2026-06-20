// Shared in-memory cache so the same data isn't refetched on every page visit.
// - Returns cached data within TTL (no "har baar" reload while navigating).
// - Dedupes concurrent requests for the same key (one network call, many readers).
// - peekCache() lets a page paint instantly from cache while it revalidates.
// - clearCache() is called on logout/switch so the next user never sees stale data.

const store = new Map();      // key -> { data, ts }
const inflight = new Map();   // key -> Promise
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes

export const peekCache = (key) => store.get(key)?.data;

const isFresh = (key, ttl) => {
  const hit = store.get(key);
  return !!hit && (Date.now() - hit.ts) < ttl;
};

// Returns the cached value if still fresh; otherwise runs `fetcher` once
// (deduped across callers) and caches the result.
export async function getCached(key, fetcher, { ttl = DEFAULT_TTL, force = false } = {}) {
  if (!force && isFresh(key, ttl)) return store.get(key).data;
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    try {
      const data = await fetcher();
      store.set(key, { data, ts: Date.now() });
      return data;
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

export const setCache = (key, data) => store.set(key, { data, ts: Date.now() });
export const invalidate = (key) => { store.delete(key); inflight.delete(key); };
export const clearCache = () => { store.clear(); inflight.clear(); };
