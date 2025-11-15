import { Schema } from 'effect';
import { imageCodec } from '@/codecs/image';

export const coverCodec = Schema.Struct({
  title: Schema.String,
  impactStatement: Schema.optional(Schema.String),
  image: imageCodec,
  item: Schema.Struct({
    type: Schema.String,
    doi: Schema.String,
  }),
});

export const coversCodec = Schema.Struct({
  total: Schema.Int,
  items: Schema.Array(
    Schema.Unknown,
  ),
});
