import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, Option, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { categoriesCodec, categoryCodec, categorySnippetCodec } from '@/codecs/categories';
import { CategoryProps } from '@/components/Categories/Categories';
import { categoriesPath, categoryPath } from '@/queries/api-paths';
import { httpGetAndValidate } from '@/queries/http';
import { withBaseUrl, iiifUri } from '@/tools';
import { CategorySnippet } from '@/types/category';
import { Image } from '@/types/image';

const prepareCategorySnippet = (
  image: Image,
  imageWidth?: number,
  imageHeight?: number,
) => (
  category: Omit<CategorySnippet, 'image'>,
): CategoryProps => ({
  id: category.id,
  title: category.name,
  uri: withBaseUrl(`/categories/${category.id}`),
  image: {
    uri: iiifUri(
      image,
      imageWidth ?? 100,
      imageHeight ?? 100,
    ),
    alt: image.alt,
    width: imageWidth ?? 100,
    height: imageHeight ?? 100,
    credit: (image.attribution !== undefined ? Option.some(image.attribution.join(', ')) : Option.none()),
  },
  description: category.impactStatement,
  aimsAndScope: (category.aimsAndScope ? Option.some(category.aimsAndScope) : Option.none()),
});

export const getCategory = (
  { id, imageWidth, imageHeight }: { id: string, imageWidth?: number, imageHeight?: number },
): Effect.Effect<
CategoryProps,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  categoryPath(id),
  httpGetAndValidate(categoryCodec),
  Effect.map(
    (category) => ({
      ...prepareCategorySnippet(
        category.image.banner,
        imageWidth,
        imageHeight,
      )(category),
    }),
  ),
);

export const getCategories = (
  { imageWidth, imageHeight }: { imageWidth?: number, imageHeight?: number } = {},
): Effect.Effect<
ReadonlyArray<CategoryProps>,
HttpClientError.HttpClientError | ParseError,
HttpClient.HttpClient
> => pipe(
  categoriesPath(),
  httpGetAndValidate(categoriesCodec),
  Effect.map(({ items }) => items),
  Effect.map(Array.filter(Schema.is(categorySnippetCodec))),
  Effect.map(
    Array.map((category) => prepareCategorySnippet(
      category.image.thumbnail,
      imageWidth,
      imageHeight,
    )(category)),
  ),
);
