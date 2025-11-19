import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, ParseResult, pipe, Schema,
} from 'effect';
import { continuumHighlightsPath } from '@/api-paths';
import { highlightCodec, highlightsCodec } from '@/codecs';
import { HighlightProps } from '@/components/Highlights/Highlights';
import { httpGetAndValidate } from '@/queries';
import { iiifUri } from '@/tools';

export const getHighlights = (
  {
    imageWidth,
    imageHeight,
    queryOptions = {},
  }: { imageWidth?: number, imageHeight?: number, queryOptions?: { limit?: number, page?: number } } = {},
): Effect.Effect<
ReadonlyArray<HighlightProps>,
HttpClientError.HttpClientError | ParseResult.ParseError,
HttpClient.HttpClient
> => pipe(
  continuumHighlightsPath(queryOptions),
  httpGetAndValidate(highlightsCodec),
  Effect.map(({ items }) => items),
  Effect.map(Array.filter(Schema.is(highlightCodec))),
  Effect.map((highlights) => (queryOptions.limit !== undefined ? highlights.slice(0, queryOptions.limit) : highlights)),
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
