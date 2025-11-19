import { HttpClient } from '@effect/platform';
import {
  Cache, Effect, pipe, Schema,
} from 'effect';

const httpRequestAndValidate = <Resp, E1, R1, Body, E2, R2>(
  request: (uri: string) => Effect.Effect<Resp, E1, R1>,
  extract: (resp: Resp) => Effect.Effect<Body, E2, R2>,
) => <A, I = unknown, Req = never>(schema: Schema.Schema<A, I, Req>) => {
  const makeCache = Cache.make({
    capacity: 100,
    timeToLive: Infinity,
    lookup: (uri: string) => pipe(
      uri,
      request,
      Effect.flatMap(extract),
      Effect.flatMap(Schema.decodeUnknown(schema)),
    ),
  });

  return (uri: string) => Effect.flatMap(makeCache, (cache) => cache.get(uri));
};

export const httpGetAndValidate = httpRequestAndValidate(
  (uri) => HttpClient.get(uri),
  (res) => res.json,
);
