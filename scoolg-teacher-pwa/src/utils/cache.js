// Shared cache so the same data isn't refetched on every page visit AND the
// screen never goes blank on a refresh.
// - Persisted to localStorage, so a HARD refresh paints last-known data instantly
//   (in-memory alone was wiped on reload -> blank screen until the network replied).
// - On a fetch failure (cold start / timeout / transient 500), returns the last
//   known value instead of letting the page fall back to empty (the "sab 0" bug).
// - Dedupes concurrent requests for the same key (one network call, many readers).
// - clearCache() runs on logout/switch so the next user never sees stale data.

const store = new Map();      // key -> { data, ts }
const inflight = new Map();   // key -> Promise
const DEFAULT_TTL = 10 * 60 * 1000; // 10 minutes
const LS_PREFIX = 'cache:';

const lsGet = (key) => {
  try { const raw = localStorage.getItem(LS_PREFIX + key); return raw ? JSON.parse(raw) : undefined; }
  catch { return undefined; }
};
const lsSet = (key, data) => {
  try { localStorage.setItem(LS_PREFIX + key, JSON.stringify(data)); } catch { /* quota / serialise */ }
};
const lsClearAll = () => {
  try { Object.keys(localStorage).forEach((k) => k.startsWith(LS_PREFIX) && localStorage.removeItem(k)); } catch { /* ignore */ }
};

// Instant paint: in-memory first, then localStorage (survives a hard refresh).
export const peekCache = (key) => {
  if (store.has(key)) return store.get(key).data;
  const v = lsGet(key);
  if (v !== undefined) { store.set(key, { data: v, ts: 0 }); return v; }
  return undefined;
};

// Always refetches (so data stays fresh), but NEVER throws away what we already
// have: if the fetch fails, it resolves with the last cached value so the page
// keeps showing real data instead of going blank.
export async function getCached(key, fetcher, { ttl = DEFAULT_TTL, force = false } = {}) {
  if (inflight.has(key)) return inflight.get(key);
  const p = (async () => {
    try {
      const data = await fetcher();
      store.set(key, { data, ts: Date.now() });
      lsSet(key, data);
      return data;
    } catch (err) {
      const cached = peekCache(key);
      if (cached !== undefined) return cached; // keep last-known instead of empty
      throw err;                               // truly nothing cached -> let caller decide
    } finally {
      inflight.delete(key);
    }
  })();
  inflight.set(key, p);
  return p;
}

export const setCache = (key, data) => { store.set(key, { data, ts: Date.now() }); lsSet(key, data); };
export const invalidate = (key) => { store.delete(key); inflight.delete(key); try { localStorage.removeItem(LS_PREFIX + key); } catch { /* ignore */ } };
export const clearCache = () => { store.clear(); inflight.clear(); lsClearAll(); };
