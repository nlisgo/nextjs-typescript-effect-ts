import { HttpClient, HttpClientError } from '@effect/platform';
import { Effect, pipe, Schema } from 'effect';
import { ParseError } from 'effect/ParseResult';
import { httpGetAndValidate } from '@/queries/http';

const coverCodec = Schema.Struct({
  title: Schema.String,
  impactStatement: Schema.optional(Schema.String),
});

const coversCodec = Schema.Struct({
  total: Schema.Int,
  items: Schema.Array(
    coverCodec,
  ),
});

// type Person = Schema.Schema.Type<typeof Person>
type Cover = Schema.Schema.Type<typeof coverCodec>;

export const getCovers = (limit?: number): Effect.Effect<
ReadonlyArray<Cover>,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  'https://api.prod.elifesciences.org/covers/current',
  httpGetAndValidate(coversCodec),
  Effect.map(({ items }) => (limit !== undefined ? items.slice(0, limit) : items)),
);
