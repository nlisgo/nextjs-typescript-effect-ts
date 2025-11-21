import { Schema } from 'effect';
import { categoryIdCodec } from '@/codecs';
import { titleCodec } from '@/codecs/title';

const continuumReviewedPreprintCodec = Schema.Struct({
  id: Schema.String,
  published: Schema.optional(
    Schema.String,
  ),
  statusDate: Schema.optional(
    Schema.String,
  ),
  title: Schema.String,
  doi: Schema.String,
  authorLine: Schema.String,
  subjects: Schema.Array(categoryIdCodec),
  version: Schema.Int,
  elifeAssessment: Schema.Struct({
    content: Schema.NonEmptyArray(Schema.Struct({
      type: Schema.Literal('paragraph'),
      text: Schema.String,
    })),
    significance: Schema.Array(Schema.String),
    strength: Schema.optional(Schema.Array(Schema.String)),
  }),
});

const continuumReviewedPreprintsCodec = Schema.Struct({
  total: Schema.Int,
  items: Schema.Array(
    continuumReviewedPreprintCodec,
  ),
});

export const reviewedPreprintsCodec = continuumReviewedPreprintsCodec;

export const eppReviewedPreprintCodec = Schema.Struct({
  article: Schema.Struct({
    msid: Schema.String,
    published: Schema.String,
    doi: Schema.String,
    versionIdentifier: Schema.String,
    subjects: Schema.Array(Schema.String),
    article: Schema.Struct({
      title: titleCodec,
    }),
  }),
});

export const reviewedPreprintCodec = continuumReviewedPreprintCodec;
