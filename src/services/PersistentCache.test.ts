import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Effect } from 'effect';

import { CACHE_DIR } from '@/config/cache-config';
import { CacheServiceTag, PersistentCacheLayer } from './PersistentCache';

jest.mock<typeof import('../config/cache-config')>('../config/cache-config', () => ({
  USE_PERSISTENT_CACHE: true,
  CACHE_DIR: path.join(os.tmpdir(), `persistent-cache-test-${Date.now()}`),
}));

describe('persistentCache', () => {
  afterAll(() => {
    if (fs.existsSync(CACHE_DIR)) {
      fs.rmSync(CACHE_DIR, { recursive: true, force: true });
    }
  });

  /* eslint-disable-next-line jest/prefer-ending-with-an-expect */
  it('merges data when merge option is provided', async () => {
    const testUrl = `http://example.com/test-merge-${Date.now()}`;

    const program = Effect.gen(function* () {
      const cache = yield* CacheServiceTag;

      // Initial fetch
      const initialData = { items: [{ id: 1, val: 'a' }] };
      const fetch1 = jest.fn<Effect.Effect<{ items: Array<{ id: number, val: string }> }, never, never>, []>()
        .mockReturnValue(Effect.succeed(initialData));

      const result1 = yield* cache.get(testUrl, fetch1);

      expect(result1).toStrictEqual(initialData);
      expect(fetch1).toHaveBeenCalledTimes(1);

      // Second fetch with merge
      const newData = { items: [{ id: 2, val: 'b' }] };
      const fetch2 = jest.fn<Effect.Effect<{ items: Array<{ id: number, val: string }> }, never, never>, []>()
        .mockReturnValue(Effect.succeed(newData));

      const mergeFn = (oldData: { items: Array<unknown> }, newData2: { items: Array<unknown> }) => ({
        items: [...oldData.items, ...newData2.items],
      });

      const result2 = yield* cache.get(testUrl, fetch2, {
        merge: mergeFn,
      });

      expect(result2).toStrictEqual({ items: [{ id: 1, val: 'a' }, { id: 2, val: 'b' }] });
      expect(fetch2).toHaveBeenCalledTimes(1); // Should force fetch

      // Third fetch without merge (should get merged result from cache)
      const fetch3 = jest.fn<Effect.Effect<{ items: Array<{ id: number, val: string }> }, never, never>, []>()
        .mockReturnValue(Effect.succeed({ items: [] }));
      const result3 = yield* cache.get(testUrl, fetch3);

      expect(result3).toStrictEqual({ items: [{ id: 1, val: 'a' }, { id: 2, val: 'b' }] });
      expect(fetch3).not.toHaveBeenCalled();
    });

    await Effect.runPromise(Effect.provide(program, PersistentCacheLayer));
  });

  /* eslint-disable-next-line jest/prefer-ending-with-an-expect */
  it('checks if cache exists using has', async () => {
    const testUrl = `http://example.com/test-has-${Date.now()}`;

    const program = Effect.gen(function* () {
      const cache = yield* CacheServiceTag;

      // Check before caching
      const existsBefore = yield* cache.has(testUrl);

      expect(existsBefore).toBe(false);

      // Cache something
      yield* cache.get(testUrl, () => Effect.succeed({ data: 'test' }));

      // Check after caching
      const existsAfter = yield* cache.has(testUrl);

      expect(existsAfter).toBe(true);
    });

    await Effect.runPromise(Effect.provide(program, PersistentCacheLayer));
  });
});
