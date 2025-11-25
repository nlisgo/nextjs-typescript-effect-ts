import { Schema } from 'effect';
import { categoryIdCodec } from '@/codecs';

export const reviewedPreprintCodec = Schema.Struct({
  id: Schema.String,
  published: Schema.optional(Schema.DateFromString),
  statusDate: Schema.optional(Schema.DateFromString),
  title: Schema.String,
  doi: Schema.String,
  authorLine: Schema.String,
  subjects: Schema.Array(categoryIdCodec),
  version: Schema.Int,
  elifeAssessment: Schema.Struct({
    content: Schema.NonEmptyArray(
      Schema.Struct({
        type: Schema.Literal('paragraph'),
        text: Schema.String,
      }),
    ),
    significance: Schema.Array(Schema.String),
    strength: Schema.optional(Schema.Array(Schema.String)),
  }),
});

export const reviewedPreprintsCodec = Schema.Array(reviewedPreprintCodec);

export const paginatedReviewedPreprintsCodec = Schema.Struct({
  total: Schema.Int,
  items: reviewedPreprintsCodec,
});
