import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { coverCodec, coversCodec } from '@/codecs/cover';
import { CoverProps } from '@/components/Cover/Cover';
import { httpGetAndValidate } from '@/queries/http';
import { iiifUri } from '@/tools/iiif-uri';

export const getCovers = (
  { imageWidth, imageHeight, limit }: { imageWidth?: number, imageHeight?: number, limit?: number },
): Effect.Effect<
ReadonlyArray<CoverProps>,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  'https://api.prod.elifesciences.org/covers/current',
  httpGetAndValidate(coversCodec),
  Effect.map(({ items }) => items),
  Effect.map(Array.filter(Schema.is(coverCodec))),
  Effect.map((items) => (limit !== undefined ? items.slice(0, limit) : items)),
  Effect.map(Array.map((item) => ({
    title: item.title,
    uri: `https://dx.doi.org/${item.item.doi}`,
    image: {
      uri: iiifUri(item.image, imageWidth ?? 100, imageHeight ?? 100),
      alt: item.image.alt,
      width: item.image.size.width,
      height: item.image.size.height,
    },
    ...(item.impactStatement ? {
      description: item.impactStatement,
    } : {}),
  }))),
);
