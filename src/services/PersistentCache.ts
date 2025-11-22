import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Context, Effect, Layer } from 'effect';
import { CACHE_DIR } from '@/config/cache-config';

// Cache service interface
export type CacheService = {
  get<A, E, R>(
    uri: string,
    fetchFn: () => Effect.Effect<A, E, R>,
    options?: {
      forceFetch?: boolean,
      merge?: (oldData: A, newData: A) => A,
    }
  ): Effect.Effect<A, E, R>,
  has(uri: string): Effect.Effect<boolean>,
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

  get: <A, E, R>(
    uri: string,
    fetchFn: () => Effect.Effect<A, E, R>,
    options?: {
      forceFetch?: boolean,
      merge?: (oldData: A, newData: A) => A,
    },
  ) => Effect.gen(function* () {
    const cacheFilePath = getCacheFilePath(uri);
    let cachedData: A | undefined;

    // Try to read from cache
    try {
      if (fs.existsSync(cacheFilePath)) {
        const cached = JSON.parse(fs.readFileSync(cacheFilePath, 'utf-8'));
        cachedData = cached.data as A;

        if (!options?.forceFetch && !options?.merge) {
          console.log(`[Cache HIT] ${uri}`);
          return cachedData;
        }
      }
    } catch (error) {
      console.warn(`[Cache READ ERROR] ${uri}:`, error);
      // Fall through to fetch
    }

    // Cache miss or forced fetch

    console.log(`[Cache ${options?.forceFetch ? 'REFRESH' : 'MISS'}] ${uri}`);
    let data = yield* fetchFn();

    // Merge if requested and we have old data
    if (options?.merge && cachedData) {
      try {
        data = options.merge(cachedData, data);

        console.log(`[Cache MERGE] ${uri}`);
      } catch (error) {
        console.warn(`[Cache MERGE ERROR] ${uri}:`, error);
      }
    }

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

  has: (uri: string) => Effect.sync(() => fs.existsSync(getCacheFilePath(uri))),
});

// In-memory cache implementation (fallback)
const makeInMemoryCache = (): CacheService => {
  const cache = new Map<string, unknown>();

  return {

    get: <A, E, R>(
      uri: string,
      fetchFn: () => Effect.Effect<A, E, R>,
      options?: {
        forceFetch?: boolean,
        merge?: (oldData: A, newData: A) => A,
      },
    ) => Effect.gen(function* () {
      if (cache.has(uri) && !options?.forceFetch) {
        return cache.get(uri) as A;
      }

      let data = yield* fetchFn();

      if (options?.merge && cache.has(uri)) {
        const cachedData = cache.get(uri) as A;
        data = options.merge(cachedData, data);
      }

      cache.set(uri, data);
      return data;
    }),

    has: (uri: string) => Effect.sync(() => cache.has(uri)),
  };
};

// Export layers
export const PersistentCacheLayer = Layer.succeed(CacheServiceTag, makePersistentCache());
export const InMemoryCacheLayer = Layer.succeed(CacheServiceTag, makeInMemoryCache());
