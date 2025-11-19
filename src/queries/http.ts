import { HttpClient } from '@effect/platform';
import { Effect, pipe, Schema } from 'effect';

const httpRequestAndValidate = <Resp, E1, R1, Body, E2, R2>(
  request: (uri: string) => Effect.Effect<Resp, E1, R1>,
  extract: (resp: Resp) => Effect.Effect<Body, E2, R2>,
) => <A, I = unknown, Req = never>(schema: Schema.Schema<A, I, Req>) => {
  const cache = new Map<string, A>();

  return (uri: string) => Effect.suspend(() => {
    if (cache.has(uri)) {
      return Effect.succeed(cache.get(uri)!);
    }

    return pipe(
      uri,
      request,
      Effect.flatMap(extract),
      Effect.flatMap(Schema.decodeUnknown(schema)),
      Effect.tap((value) => Effect.sync(() => {
        cache.set(uri, value);
      })),
    );
  });
};

export const httpGetAndValidate = httpRequestAndValidate(
  (uri) => HttpClient.get(uri),
  (res) => res.json,
);
