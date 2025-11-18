import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, Option, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { reviewedPreprintCodec, reviewedPreprintsCodec } from '@/codecs';
import { TeaserProps } from '@/components/Teasers/Teasers';
import { reviewedPreprintsPath, httpGetAndValidate } from '@/queries';

export const getReviewedPreprints = (
  { limit = 10 }: { limit?: number } = {},
): Effect.Effect<
ReadonlyArray<TeaserProps>,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  reviewedPreprintsPath({ limit }),
  httpGetAndValidate(reviewedPreprintsCodec),
  Effect.map(({ items }) => items),
  Effect.map(Array.filter(Schema.is(reviewedPreprintCodec))),
  Effect.map(Array.map((reviewedPreprint) => ({
    title: reviewedPreprint.title,
    uri: `https://elifesciences.org/reviewed-preprints/${reviewedPreprint.id}`,
    description: reviewedPreprint.authorLine,
    image: Option.none(),
    published: Option.none(),
    categories: Option.some(reviewedPreprint.subjects),
  }))),
);
