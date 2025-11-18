import { Schema } from 'effect';
import { categoryIdCodec } from '@/codecs';
import { titleCodec } from '@/codecs/title';

const continuumReviewedPreprintsCodec = Schema.Struct({
  total: Schema.Int,
  items: Schema.Array(
    Schema.Unknown,
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
});

export const reviewedPreprintCodec = continuumReviewedPreprintCodec;
