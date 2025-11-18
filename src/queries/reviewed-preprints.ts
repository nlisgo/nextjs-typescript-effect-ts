import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { continuumReviewedPreprintPath, continuumReviewedPreprintsPath } from '@/api-paths';
import { reviewedPreprintCodec, reviewedPreprintsCodec } from '@/codecs';
import { TeaserProps } from '@/components/Teasers/Teasers';
import { httpGetAndValidate } from '@/queries';
import { withBaseUrl } from '@/tools';

const getContinuumReviewedPreprint = (
  { id }: { id: string },
): Effect.Effect<
TeaserProps,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  continuumReviewedPreprintPath(id),
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

const getContinuumReviewedPreprints = (
  { limit = 10 }: { limit?: number } = {},
): Effect.Effect<
ReadonlyArray<TeaserProps>,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  continuumReviewedPreprintsPath({ limit }),
  httpGetAndValidate(reviewedPreprintsCodec),
  Effect.map(({ items }) => items),
  Effect.map(Array.filter(Schema.is(reviewedPreprintCodec))),
  Effect.map(Array.map((reviewedPreprint) => ({
    id: reviewedPreprint.id,
    title: reviewedPreprint.title,
    uri: withBaseUrl(`/reviewed-preprints/${reviewedPreprint.id}`),
    description: reviewedPreprint.authorLine,
    published: reviewedPreprint.statusDate ? new Date(reviewedPreprint.statusDate) : undefined,
    categories: reviewedPreprint.subjects,
  }))),
);

export const getReviewedPreprint = getContinuumReviewedPreprint;

export const getReviewedPreprints = getContinuumReviewedPreprints;
