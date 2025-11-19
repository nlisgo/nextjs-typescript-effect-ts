import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Context, Effect, Layer } from 'effect';
import { CACHE_DIR } from '@/config/cache-config';

// Cache service interface
export type CacheService = {
  get<A, E, R>(uri: string, fetchFn: () => Effect.Effect<A, E, R>): Effect.Effect<A, E, R>,
};

// Service tag for dependency injection
export class CacheServiceTag extends Context.Tag('CacheService')<
CacheServiceTag,
CacheService
>() { }

// Hash URL to create cache filename
const hashUrl = (url: string): string => crypto.createHash('md5').update(url).digest('hex');

// Get cache file path for a URL
const getCacheFilePath = (url: string): string => path.join(CACHE_DIR, `${hashUrl(url)}.json`);

// Persistent cache implementation
const makePersistentCache = (): CacheService => ({
  get: <A, E, R>(uri: string, fetchFn: () => Effect.Effect<A, E, R>) => Effect.gen(function* () {
    const cacheFilePath = getCacheFilePath(uri);

    // Try to read from cache
    try {
      if (fs.existsSync(cacheFilePath)) {
        const cached = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
        console.log(`[Cache HIT] ${uri}`);
        return cached.data as A;
      }
    } catch (error) {
      console.warn(`[Cache READ ERROR] ${uri}:`, error);
      // Fall through to fetch
    }

    // Cache miss - fetch from API
    console.log(`[Cache MISS] ${uri}`);
    const data = yield* fetchFn();

    // Write to cache
    try {
      fs.mkdirSync(path.dirname(cacheFilePath), { recursive: true });
      fs.writeFileSync(
        cacheFilePath,
        JSON.stringify({
          url: uri,
          timestamp: new Date().toISOString(),
          data,
        }, null, 2),
      );
      console.log(`[Cache WRITE] ${uri}`);
    } catch (error) {
      console.warn(`[Cache WRITE ERROR] ${uri}:`, error);
      // Continue even if write fails
    }

    return data;
  }),
});

// In-memory cache implementation (fallback)
const makeInMemoryCache = (): CacheService => {
  const cache = new Map<string, unknown>();

  return {
    get: <A, E, R>(uri: string, fetchFn: () => Effect.Effect<A, E, R>) => Effect.gen(function* () {
      if (cache.has(uri)) {
        return cache.get(uri) as A;
      }

      const data = yield* fetchFn();
      cache.set(uri, data);
      return data;
    }),
  };
};

// Export layers
export const PersistentCacheLayer = Layer.succeed(CacheServiceTag, makePersistentCache());
export const InMemoryCacheLayer = Layer.succeed(CacheServiceTag, makeInMemoryCache());
