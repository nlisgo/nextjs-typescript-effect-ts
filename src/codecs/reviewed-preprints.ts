import { Schema } from 'effect';
import { categoryIdCodec } from '@/codecs';

export const reviewedPreprintCodec = Schema.Struct({
  id: Schema.String,
  published: Schema.optional(Schema.DateFromString),
  statusDate: Schema.optional(Schema.DateFromString),
  title: Schema.String,
  doi: Schema.optional(Schema.String),
  authorLine: Schema.optional(Schema.String),
  subjects: Schema.optional(Schema.Array(categoryIdCodec)),
  version: Schema.optional(Schema.Int),
  elifeAssessment: Schema.optional(
    Schema.Struct({
      content: Schema.NonEmptyArray(
        Schema.Struct({
          type: Schema.Literal('paragraph'),
          text: Schema.String,
        }),
      ),
      significance: Schema.optional(Schema.Array(Schema.String)),
      strength: Schema.optional(Schema.Array(Schema.String)),
    }),
  ),
  hash: Schema.optional(Schema.String),
});

export const reviewedPreprintsCodec = Schema.Array(reviewedPreprintCodec);

export const paginatedReviewedPreprintsCodec = Schema.Struct({
  total: Schema.Int,
  items: reviewedPreprintsCodec,
});
