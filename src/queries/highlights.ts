import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, ParseResult, pipe, Schema,
} from 'effect';
import { continuumHighlightsPath } from '@/api-paths';
import { highlightCodec, highlightsCodec } from '@/codecs';
import { HighlightProps } from '@/components/Highlights/Highlights';
import { httpGetAndValidate } from '@/queries';
import { CacheServiceTag } from '@/services/PersistentCache';
import { iiifUri } from '@/tools';

const strictHighlightsCodec = Schema.Struct({
  total: Schema.Int,
  items: Schema.Array(highlightCodec),
});

const filteredHighlightsCodec = Schema.transform(
  highlightsCodec,
  strictHighlightsCodec,
  {
    decode: (input) => ({
      ...input,
      items: input.items.filter(Schema.is(highlightCodec)),
    }),
    encode: (input) => input,
  },
);

export const getHighlights = (
  {
    imageWidth,
    imageHeight,
  }: { imageWidth?: number, imageHeight?: number } = {},
): Effect.Effect<
ReadonlyArray<HighlightProps>,
HttpClientError.HttpClientError | ParseResult.ParseError,
HttpClient.HttpClient | CacheServiceTag
> => pipe(
  continuumHighlightsPath(),
  httpGetAndValidate(filteredHighlightsCodec, {
    useCache: true,
    merge: (oldData, newData) => ({
      ...newData,
      items: [
        ...newData.items,
        ...oldData.items.filter(Schema.is(highlightCodec)).filter((oldItem) => !newData.items.some(
          (newItem) => newItem.item.doi === oldItem.item.doi,
        )),
      ],
    }),
  }),
  Effect.map(({ items }) => items),
  Effect.map(Array.filter(Schema.is(highlightCodec))),
  Effect.map((highlights) => highlights.slice(0, 3)),
  Effect.map(Array.map((highlight) => ({
    title: highlight.title,
    uri: `https://dx.doi.org/${highlight.item.doi}`,
    image: {
      uri: iiifUri(highlight.image, imageWidth ?? 100, imageHeight ?? 100),
      alt: highlight.image.alt,
      width: imageWidth ?? 100,
      height: imageHeight ?? 100,
    },
    description: highlight.impactStatement,
  }))),
);
