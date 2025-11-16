import { Schema } from 'effect';
import { imageCodec } from '@/codecs/image';

export const categoryCodec = Schema.Struct({
  name: Schema.String,
  id: Schema.String,
  impactStatement: Schema.String,
  image: Schema.Struct({
    banner: imageCodec,
  }),
});

export const categorySnippetCodec = Schema.Struct({
  name: Schema.String,
  id: Schema.String,
  impactStatement: Schema.String,
  image: Schema.Struct({
    thumbnail: imageCodec,
  }),
});

export const categoriesCodec = Schema.Struct({
  total: Schema.Int,
  items: Schema.Array(
    Schema.Unknown,
  ),
});
