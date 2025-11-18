import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { continuumReviewedPreprintPath, continuumReviewedPreprintsPath, eppReviewedPreprintPath } from '@/api-paths';
import { reviewedPreprintCodec, reviewedPreprintsCodec } from '@/codecs';
import { eppReviewedPreprintCodec } from '@/codecs/reviewed-preprints';
import { TeaserProps } from '@/components/Teasers/Teasers';
import { httpGetAndValidate } from '@/queries';
import { withBaseUrl } from '@/tools';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const getContinuumReviewedPreprint = (
  { id }: { id: string },
): Effect.Effect<
TeaserProps,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  id,
  continuumReviewedPreprintPath,
  httpGetAndValidate(reviewedPreprintCodec),
  Effect.map((reviewedPreprint) => ({
    id: reviewedPreprint.id,
    title: reviewedPreprint.title,
    uri: withBaseUrl(`reviewed-preprints/${reviewedPreprint.id}`),
    description: reviewedPreprint.authorLine,
    published: reviewedPreprint.statusDate ? new Date(reviewedPreprint.statusDate) : undefined,
    categories: reviewedPreprint.subjects,
  })),
);

const getEppReviewedPreprint = (
  { id }: { id: string },
): Effect.Effect<
TeaserProps,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  id,
  eppReviewedPreprintPath,
  httpGetAndValidate(eppReviewedPreprintCodec),
  Effect.map((reviewedPreprint) => ({
    id: reviewedPreprint.article.msid,
    title: typeof reviewedPreprint.article.article.title === 'string' ? reviewedPreprint.article.article.title : `Unsupported: ${JSON.stringify(reviewedPreprint.article.article.title)}`,
    uri: withBaseUrl(`/reviewed-preprints/${reviewedPreprint.article.msid}`),
    description: 'Authors et al.',
    published: new Date(reviewedPreprint.article.published),
  })),
);

const getContinuumReviewedPreprints = (
  { limit = 20 }: { limit?: number } = {},
): Effect.Effect<
ReadonlyArray<TeaserProps>,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  { limit },
  continuumReviewedPreprintsPath,
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

export const getReviewedPreprint = getEppReviewedPreprint;

export const getReviewedPreprints = getContinuumReviewedPreprints;
