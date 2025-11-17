import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, Option, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { reviewedPreprintCodec, reviewedPreprintsCodec } from '@/codecs/reviewed-preprints';
import { TeaserProps } from '@/components/Teasers/Teasers';
import { httpGetAndValidate } from '@/queries/http';

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
    uri: `https://elifesciences.org/reviewed-preprints/${reviewedPreprint.id}`,
    description: reviewedPreprint.authorLine,
    image: Option.none(),
    categories: Option.some(reviewedPreprint.subjects),
  }))),
);
