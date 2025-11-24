import { Schema } from 'effect';

export const imageCodec = Schema.Struct({
  uri: Schema.String,
  alt: Schema.String,
  source: Schema.Struct({
    mediaType: Schema.String,
    uri: Schema.String,
    filename: Schema.String,
  }),
  size: Schema.Struct({
    width: Schema.Int,
    height: Schema.Int,
  }),
  attribution: Schema.optional(Schema.Array(Schema.String)),
});
