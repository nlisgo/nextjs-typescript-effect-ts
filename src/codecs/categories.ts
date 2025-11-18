import { Schema } from 'effect';
import { imageCodec } from '@/codecs';

const categoryIdShape = {
  name: Schema.String,
  id: Schema.String,
};

const categoryBaseShape = {
  ...categoryIdShape,
  impactStatement: Schema.String,
  aimsAndScope: Schema.optional(
    Schema.Array(
      Schema.Struct({
        type: Schema.Literal('paragraph'),
        text: Schema.String,
      }),
    ),
  ),
};

export const categoryIdCodec = Schema.Struct(categoryIdShape);

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
