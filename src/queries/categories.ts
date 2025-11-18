import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { categoriesCodec, categoryCodec, categorySnippetCodec } from '@/codecs';
import { CategoryProps } from '@/components/Categories/Categories';
import { categoriesPath, categoryPath, httpGetAndValidate } from '@/queries';
import { withBaseUrl, iiifUri } from '@/tools';
import { CategorySnippet, Image } from '@/types';

const prepareCategorySnippet = ({
  image,
  imageWidth,
  imageHeight,
}: {
  image: Image,
  imageWidth?: number,
  imageHeight?: number,
}) => (
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
    credit: (image.attribution ? image.attribution.join(', ') : undefined),
  },
  description: category.impactStatement,
  aimsAndScope: category.aimsAndScope,
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
      ...prepareCategorySnippet({
        image: category.image.banner,
        imageWidth,
        imageHeight,
      })(category),
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
    Array.map((category) => prepareCategorySnippet({
      image: category.image.thumbnail,
      imageWidth,
      imageHeight,
    })(category)),
  ),
);
