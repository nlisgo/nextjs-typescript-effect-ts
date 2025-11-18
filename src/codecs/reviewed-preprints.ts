import { Schema } from 'effect';
import { categoryIdCodec } from '@/codecs';

export const reviewedPreprintsCodec = Schema.Struct({
  total: Schema.Int,
  items: Schema.Array(
    Schema.Unknown,
  ),
});

export const reviewedPreprintCodec = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  doi: Schema.String,
  authorLine: Schema.String,
  subjects: Schema.Array(categoryIdCodec),
  version: Schema.Int,
});
