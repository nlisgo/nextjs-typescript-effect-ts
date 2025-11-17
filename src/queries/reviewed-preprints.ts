import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, Option, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { categoryIdCodec } from '@/codecs/categories';
import { TeaserProps } from '@/components/Teasers/Teasers';
import { httpGetAndValidate } from '@/queries/http';

const reviewedPreprintsCodec = Schema.Struct({
  total: Schema.Int,
  items: Schema.Array(
    Schema.Unknown,
  ),
});

const reviewedPreprintCodec = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  doi: Schema.String,
  authorLine: Schema.String,
  subjects: Schema.Array(categoryIdCodec),
  version: Schema.Int,
});

export const getReviewedPreprints = (
  { limit }: { limit?: number } = {},
): Effect.Effect<
ReadonlyArray<TeaserProps>,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  `https://api.prod.elifesciences.org/search?sort=date&order=desc&type[]=reviewed-preprint&per-page=${Math.min(limit ?? 10, 100)}&page=1`,
  httpGetAndValidate(reviewedPreprintsCodec),
  Effect.map(({ items }) => items),
  Effect.map(Array.filter(Schema.is(reviewedPreprintCodec))),
  Effect.map(Array.map((reviewedPreprint) => ({
    title: reviewedPreprint.title,
    uri: `https://dx.doi.org/${reviewedPreprint.doi}`,
    description: reviewedPreprint.authorLine,
    image: Option.none(),
    categories: Option.some(reviewedPreprint.subjects),
  }))),
);
