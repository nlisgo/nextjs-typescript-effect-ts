import { HttpClient } from '@effect/platform';
import {
  Effect, ParseResult, pipe, Schema,
} from 'effect';
import { CacheServiceTag } from '@/services/PersistentCache';

const httpRequestAndValidate = <Resp, E1, R1, Body, E2, R2>(
  request: (uri: string) => Effect.Effect<Resp, E1, R1>,
  extract: (resp: Resp) => Effect.Effect<Body, E2, R2>,
) => <A, I = unknown, Req = never>(schema: Schema.Schema<A, I, Req>) => (
    uri: string,
    // eslint-disable-next-line func-names
  ): Effect.Effect<A, E1 | E2 | ParseResult.ParseError, R1 | R2 | Req | CacheServiceTag> => Effect.gen(function* () {
    const cache = yield* CacheServiceTag;

    return yield* cache.get<A, E1 | E2 | ParseResult.ParseError, R1 | R2 | Req>(uri, () => pipe(
      uri,
      request,
      Effect.flatMap(extract),
      Effect.flatMap(Schema.decodeUnknown(schema)),
    ));
  });

export const httpGetAndValidate = httpRequestAndValidate(
  (uri) => HttpClient.get(uri),
  (res) => res.json,
);
