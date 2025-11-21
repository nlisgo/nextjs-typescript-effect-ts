import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, ParseResult, pipe, Schema,
} from 'effect';
import { continuumReviewedPreprintPath, continuumReviewedPreprintsPath, eppReviewedPreprintPath } from '@/api-paths';
import { reviewedPreprintCodec, reviewedPreprintsCodec } from '@/codecs';
import { eppReviewedPreprintCodec } from '@/codecs/reviewed-preprints';
import { TeaserProps } from '@/components/Teasers/Teasers';
import { httpGetAndValidate } from '@/queries';
import { CacheServiceTag } from '@/services/PersistentCache';
import { withBaseUrl } from '@/tools';
import { ReviewedPreprint } from '@/types';

export const getContinuumReviewedPreprint = (
  { id }: { id: string },
): Effect.Effect<
ReviewedPreprint,
HttpClientError.HttpClientError | ParseResult.ParseError,
HttpClient.HttpClient | CacheServiceTag
> => pipe(
  id,
  continuumReviewedPreprintPath,
  httpGetAndValidate(reviewedPreprintCodec, { useCache: true }),
  Effect.map((reviewedPreprint) => ({
    id: reviewedPreprint.id,
    title: reviewedPreprint.title,
    uri: withBaseUrl(`reviewed-preprints/${reviewedPreprint.id}`),
    description: reviewedPreprint.authorLine,
    published: reviewedPreprint.statusDate ? new Date(reviewedPreprint.statusDate) : undefined,
    categories: reviewedPreprint.subjects,
    evaluationSummary: reviewedPreprint.elifeAssessment.content,
  })),
);

const getEppReviewedPreprint = (
  { id }: { id: string },
): Effect.Effect<
TeaserProps,
HttpClientError.HttpClientError | ParseResult.ParseError,
HttpClient.HttpClient | CacheServiceTag
> => pipe(
  id,
  eppReviewedPreprintPath,
  httpGetAndValidate(eppReviewedPreprintCodec, { useCache: true }),
  Effect.map((reviewedPreprint) => ({
    id: reviewedPreprint.article.msid,
    title: reviewedPreprint.article.article.title,
    uri: withBaseUrl(`/reviewed-preprints/${reviewedPreprint.article.msid}`),
    description: 'Authors et al.',
    published: new Date(reviewedPreprint.article.published),
  })),
);

const getContinuumReviewedPreprints = (
  { limit = 20, page = 1 }: { limit?: number, page?: number } = {},
): Effect.Effect<
ReadonlyArray<TeaserProps>,
HttpClientError.HttpClientError | ParseResult.ParseError,
HttpClient.HttpClient | CacheServiceTag
> => pipe(
  { limit, page },
  continuumReviewedPreprintsPath,
  httpGetAndValidate(reviewedPreprintsCodec, {
    useCache: true,
    merge: (oldData, newData) => ({
      ...newData,
      items: [
        ...newData.items,
        ...oldData.items.filter((oldItem) => !newData.items.some(
          (newItem) => newItem.id === oldItem.id,
        )),
      ],
    }),
  }),
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
