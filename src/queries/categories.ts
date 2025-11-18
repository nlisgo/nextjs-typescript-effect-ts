import { HttpClient, HttpClientError } from '@effect/platform';
import {
  Array, Effect, Option, pipe, Schema,
} from 'effect';
import { ParseError } from 'effect/ParseResult';
import { categoriesCodec, categoryCodec, categorySnippetCodec } from '@/codecs';
import { CategoryProps } from '@/components/Categories/Categories';
import { categoriesPath, categoryPath, httpGetAndValidate } from '@/queries';
import { withBaseUrl, iiifUri } from '@/tools';
import { CategorySnippet, Image } from '@/types';

const prepareCategorySnippet = ({
  image,
  imageWidth = Option.none(),
  imageHeight = Option.none(),
}: {
  image: Image,
  imageWidth?: Option.Option<number>,
  imageHeight?: Option.Option<number>,
}) => (
  category: Omit<CategorySnippet, 'image'>,
): CategoryProps => ({
  id: category.id,
  title: category.name,
  uri: withBaseUrl(`/categories/${category.id}`),
  image: {
    uri: iiifUri(
      image,
      Option.getOrElse(() => 100)(imageWidth),
      Option.getOrElse(() => 100)(imageHeight),
    ),
    alt: image.alt,
    width: Option.getOrElse(() => 100)(imageWidth),
    height: Option.getOrElse(() => 100)(imageHeight),
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
      ...prepareCategorySnippet({
        image: category.image.banner,
        imageWidth: imageWidth ? Option.some(imageWidth) : Option.none(),
        imageHeight: imageHeight ? Option.some(imageHeight) : Option.none(),
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
      imageWidth: imageWidth ? Option.some(imageWidth) : Option.none(),
      imageHeight: imageHeight ? Option.some(imageHeight) : Option.none(),
    })(category)),
  ),
);
