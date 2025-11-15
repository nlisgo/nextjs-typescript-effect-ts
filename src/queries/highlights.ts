import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { highlightCodec, highlightsCodec } from '@/codecs/highlights';
import { HighlightProps } from '@/components/Highlights/Highlights';
import { httpGetAndValidate } from '@/queries/http';
import { iiifUri } from '@/tools/iiif-uri';

export const getHighlights = (
  { imageWidth, imageHeight, limit }: { imageWidth?: number, imageHeight?: number, limit?: number } = {},
): Effect.Effect<
ReadonlyArray<HighlightProps>,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  `https://api.prod.elifesciences.org/covers?per-page=${Math.min((limit ?? 3) * 2, 100)}&page=1`,
  httpGetAndValidate(highlightsCodec),
  Effect.map(({ items }) => items),
  Effect.map(Array.filter(Schema.is(highlightCodec))),
  Effect.map((highlights) => (limit !== undefined ? highlights.slice(0, limit) : highlights)),
  Effect.map(Array.map((highlight) => ({
    title: highlight.title,
    uri: `https://dx.doi.org/${highlight.item.doi}`,
    image: {
      uri: iiifUri(highlight.image, imageWidth ?? 100, imageHeight ?? 100),
      alt: highlight.image.alt,
      width: imageWidth ?? 100,
      height: imageHeight ?? 100,
    },
    ...(highlight.impactStatement ? {
      description: highlight.impactStatement,
    } : {}),
  }))),
);
