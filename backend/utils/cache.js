const DEFAULT_TTL_MS = 5 * 60 * 1000;

const cacheStore = new Map();

/**
 * Simple in-memory TTL cache for expensive backend calls.
 *
 * @param {string} key
 * @param {number} [ttlMs=DEFAULT_TTL_MS]
 * @returns {unknown | undefined}
 */
export function getCachedValue(key, ttlMs = DEFAULT_TTL_MS) {
  const entry = cacheStore.get(key);

  if (!entry) {
    return undefined;
  }

  if (Date.now() > entry.expiresAt) {
    cacheStore.delete(key);
    return undefined;
  }

  return entry.value;
}

/**
 * Stores a value in the in-memory TTL cache.
 *
 * @param {string} key
 * @param {unknown} value
 * @param {number} [ttlMs=DEFAULT_TTL_MS]
 */
export function setCachedValue(key, value, ttlMs = DEFAULT_TTL_MS) {
  cacheStore.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });
}

export function clearCache() {
  cacheStore.clear();
}
