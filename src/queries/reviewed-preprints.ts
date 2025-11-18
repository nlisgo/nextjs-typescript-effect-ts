import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { reviewedPreprintCodec, reviewedPreprintsCodec } from '@/codecs';
import { TeaserProps } from '@/components/Teasers/Teasers';
import { reviewedPreprintsPath, httpGetAndValidate } from '@/queries';
import { reviewedPreprintPath } from '@/queries/api-paths';

export const getReviewedPreprint = (
  { id }: { id: string },
): Effect.Effect<
TeaserProps,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  reviewedPreprintPath(id),
  httpGetAndValidate(reviewedPreprintCodec),
  Effect.map((reviewedPreprint) => ({
    id: reviewedPreprint.id,
    title: reviewedPreprint.title,
    uri: `https://elifesciences.org/reviewed-preprints/${reviewedPreprint.id}`,
    description: reviewedPreprint.authorLine,
    published: reviewedPreprint.statusDate ? new Date(reviewedPreprint.statusDate) : undefined,
    categories: reviewedPreprint.subjects,
  })),
);

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
    id: reviewedPreprint.id,
    title: reviewedPreprint.title,
    uri: `https://elifesciences.org/reviewed-preprints/${reviewedPreprint.id}`,
    description: reviewedPreprint.authorLine,
    published: reviewedPreprint.statusDate ? new Date(reviewedPreprint.statusDate) : undefined,
    categories: reviewedPreprint.subjects,
  }))),
);
