import * as crypto from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { Effect, Schema } from 'effect';
import { CACHE_DIR } from '@/config/cache-config';
import { PersistentCacheLayer } from '@/services/PersistentCache';
import { httpRequestAndValidate } from './http';

// Mock config to use a temp directory for cache
jest.mock<typeof import('../config/cache-config')>('../config/cache-config', () => ({
  USE_PERSISTENT_CACHE: true,
  CACHE_DIR: path.join(os.tmpdir(), `http-test-cache-${Date.now()}`),
}));

// eslint-disable-next-line jest/no-untyped-mock-factory
jest.mock('@effect/platform', () => ({
  HttpClient: {
    get: jest.fn(),
  },
}));

type TestData = {
  readonly items: ReadonlyArray<{ readonly id: number }>,
};

describe('httpRequestAndValidate', () => {
  afterAll(() => {
    if (fs.existsSync(CACHE_DIR)) {
      fs.rmSync(CACHE_DIR, { recursive: true, force: true });
    }
  });

  it('accumulates items in cache but returns limited results', async () => {
    const testUrl = `http://example.com/test-limit-${Date.now()}`;
    const schema = Schema.Struct({
      items: Schema.Array(Schema.Struct({ id: Schema.Number })),
    });

    // Setup the http request function
    const requestMock = jest.fn<TestData, [string]>();
    const extractMock = (res: TestData) => Effect.succeed(res);

    const executeRequest = httpRequestAndValidate(
      (uri) => Effect.succeed(requestMock(uri)),
      extractMock,
    )(schema, {
      useCache: true,
      merge: (oldData: TestData, newData: TestData) => ({
        items: [...oldData.items, ...newData.items],
      }),
      queryParams: { limit: 2 },
    });

    // 1. First Request
    // Mock returning 3 items
    requestMock.mockReturnValue({
      items: [{ id: 1 }, { id: 2 }, { id: 3 }],
    });

    const result1 = await Effect.runPromise(
      Effect.provide(executeRequest(testUrl), PersistentCacheLayer),
    ) as TestData;

    // Should return only 2 items (limit)
    expect(result1.items).toStrictEqual([{ id: 1 }, { id: 2 }]);

    // Check cache file - should contain all 3 items
    const cacheFile = path.join(CACHE_DIR, `${crypto.createHash('md5').update(testUrl).digest('hex')}.json`);
    const cachedContent1 = JSON.parse(fs.readFileSync(cacheFile, 'utf-8')) as { data: TestData };

    expect(cachedContent1.data.items).toHaveLength(3);

    // 2. Second Request (fetching new data)
    // Mock returning 2 NEW items
    requestMock.mockReturnValue({
      items: [{ id: 4 }, { id: 5 }],
    });

    const result2 = await Effect.runPromise(
      Effect.provide(executeRequest(testUrl), PersistentCacheLayer),
    ) as TestData;

    // Should return 2 items (limit) - but which ones?
    // Usually limit applies to the start. So still 1, 2.
    expect(result2.items).toStrictEqual([{ id: 1 }, { id: 2 }]);

    // Check cache file - should have merged: 3 + 2 = 5 items
    const cachedContent2 = JSON.parse(fs.readFileSync(cacheFile, 'utf-8')) as { data: TestData };

    expect(cachedContent2.data.items).toStrictEqual([
      { id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 },
    ]);
  });
});
