import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { categoriesCodec, categoryCodec, categorySnippetCodec } from '@/codecs/categories';
import { CategoryProps } from '@/components/Categories/Categories';
import { httpGetAndValidate } from '@/queries/http';
import { iiifUri } from '@/tools/iiif-uri';

const defaultThumbnailImageWidth = 50;
const defaultThumbnailImageHeight = 50;

export const getCategory = (
  { id, imageWidth, imageHeight }: { id: string, imageWidth?: number, imageHeight?: number },
): Effect.Effect<
CategoryProps,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  `https://api.prod.elifesciences.org/subjects/${id}`,
  httpGetAndValidate(categoryCodec),
  Effect.map((category) => ({
    title: category.name,
    uri: `https://elifesciences.org/subjects/${category.id}`,
    image: {
      uri: iiifUri(
        category.image.banner,
        imageWidth ?? defaultThumbnailImageWidth,
        imageHeight ?? defaultThumbnailImageHeight,
      ),
      alt: category.image.banner.alt,
      width: imageWidth ?? defaultThumbnailImageWidth,
      height: imageHeight ?? defaultThumbnailImageHeight,
    },
    ...(category.impactStatement ? {
      description: category.impactStatement,
    } : {}),
  })),
);

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
  Effect.map(Array.filter(Schema.is(categorySnippetCodec))),
  Effect.map(Array.map((category) => ({
    title: category.name,
    uri: `https://elifesciences.org/subjects/${category.id}`,
    image: {
      uri: iiifUri(
        category.image.thumbnail,
        imageWidth ?? defaultThumbnailImageWidth,
        imageHeight ?? defaultThumbnailImageHeight,
      ),
      alt: category.image.thumbnail.alt,
      width: imageWidth ?? defaultThumbnailImageWidth,
      height: imageHeight ?? defaultThumbnailImageHeight,
    },
    ...(category.impactStatement ? {
      description: category.impactStatement,
    } : {}),
  }))),
);
