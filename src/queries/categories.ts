import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { categoriesCodec, categoryCodec } from '@/codecs/categories';
import { CategoryProps } from '@/components/Categories/Categories';
import { httpGetAndValidate } from '@/queries/http';
import { iiifUri } from '@/tools/iiif-uri';

const defaultImageWidth = 50;
const defaultImageHeight = 50;

export const getCategories = (
  { imageWidth, imageHeight }: { imageWidth?: number, imageHeight?: number },
): Effect.Effect<
ReadonlyArray<CategoryProps>,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  'https://api.prod.elifesciences.org/subjects?per-page=18&page=1',
  httpGetAndValidate(categoriesCodec),
  Effect.map(({ items }) => items),
  Effect.map(Array.filter(Schema.is(categoryCodec))),
  Effect.map(Array.map((category) => ({
    title: category.name,
    uri: `https://elifesciences.org/subjects/${category.id}`,
    image: {
      uri: iiifUri(category.image.thumbnail, imageWidth ?? defaultImageWidth, imageHeight ?? defaultImageHeight),
      alt: category.image.thumbnail.alt,
      width: imageWidth ?? defaultImageWidth,
      height: imageHeight ?? defaultImageHeight,
    },
    ...(category.impactStatement ? {
      description: category.impactStatement,
    } : {}),
  }))),
);
