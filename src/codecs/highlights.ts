import { Schema } from 'effect';
import { imageCodec } from '@/codecs/image';

export const highlightCodec = Schema.Struct({
  title: Schema.String,
  impactStatement: Schema.optional(Schema.String),
  image: imageCodec,
  item: Schema.Struct({
    type: Schema.String,
    doi: Schema.String,
  }),
  hash: Schema.optional(Schema.String),
});

export const highlightsCodec = Schema.Array(
  highlightCodec,
);
