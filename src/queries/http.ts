import { HttpClient } from '@effect/platform';
import {
  Effect, ParseResult, pipe, Schema,
} from 'effect';
import { CacheServiceTag } from '@/services/PersistentCache';

export const httpRequestAndValidate = <Resp, E1, R1, Body, E2, R2>(
  request: (uri: string) => Effect.Effect<Resp, E1, R1>,
  extract: (resp: Resp) => Effect.Effect<Body, E2, R2>,
) => <A, I = unknown, Req = never>(
    schema: Schema.Schema<A, I, Req>,
    options?: {
      queryParams?: {
        limit: number,
        page?: number,
      },
      useCache?: boolean,
      merge?: (oldData: A, newData: A) => A,
    },
  ) => (
      uri: string,
    ): Effect.Effect<A, E1 | E2 | ParseResult.ParseError, R1 | R2 | Req | CacheServiceTag> => Effect.gen(function* () {
      const cache = yield* CacheServiceTag;

      if (options?.useCache) {
        // Fetch and cache full data (without limit applied)
        const cachedData = yield* cache.get<A, E1 | E2 | ParseResult.ParseError, R1 | R2 | Req>(
          uri,
          () => pipe(
            uri,
            request,
            Effect.flatMap(extract),
            Effect.flatMap(Schema.decodeUnknown(schema)),
          ),
          options.merge ? {
            forceFetch: true,
            merge: options.merge,
          } : undefined,
        );

        // Apply limit after caching (so full data is preserved in cache)
        if (options?.queryParams?.limit && options.queryParams.limit > 0) {
          // Handle nested structures like { items: [...] }
          if (typeof cachedData === 'object' && cachedData !== null && 'items' in cachedData) {
            const dataWithItems = cachedData as { items: unknown };
            if (Array.isArray(dataWithItems.items)) {
              return {
                ...cachedData,
                items: dataWithItems.items.slice(0, options.queryParams.limit),
              } as A;
            }
          }
          // Handle top-level arrays
          if (Array.isArray(cachedData)) {
            return (cachedData as unknown as Array<unknown>).slice(0, options.queryParams.limit) as A;
          }
        }

        return cachedData;
      }

      return yield* pipe(
        uri,
        request,
        Effect.flatMap(extract),
        Effect.flatMap(Schema.decodeUnknown(schema)),
      );
    });

export const httpGetAndValidate = httpRequestAndValidate(
  (uri) => HttpClient.get(uri),
  (res) => res.json,
);
