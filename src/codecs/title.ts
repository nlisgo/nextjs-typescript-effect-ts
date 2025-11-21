import { Schema } from 'effect';

export const titleCodec = Schema.Union(
  Schema.String,
  Schema.Array(
    Schema.Union(
      Schema.String,
      Schema.Struct({
        type: Schema.Union(
          Schema.Literal('Emphasis'),
          Schema.Literal('Subscript'),
          Schema.Literal('Superscript'),
        ),
        content: Schema.Array(
          Schema.String,
        ),
      }),
    ),
  ),
);
