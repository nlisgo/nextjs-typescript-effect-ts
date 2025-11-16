import { Schema } from 'effect';
import { imageCodec } from '@/codecs/image';

const categoryBaseShape = {
  name: Schema.String,
  id: Schema.String,
  impactStatement: Schema.String,
  aimsAndScope: Schema.optional(
    Schema.Array(
      Schema.Struct({
        type: Schema.Literal('paragraph'),
        text: Schema.String,
      }),
    ),
  ),
} as const;

export const categoryCodec = Schema.Struct({
  ...categoryBaseShape,
  image: Schema.Struct({
    thumbnail: imageCodec,
    banner: imageCodec,
  }),
});

export const categorySnippetCodec = Schema.Struct({
  ...categoryBaseShape,
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
