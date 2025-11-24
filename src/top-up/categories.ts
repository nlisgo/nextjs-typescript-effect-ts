import { Error as PlatformError, FileSystem, HttpClient } from '@effect/platform';
import {
  Array, Effect, Order, ParseResult, pipe, Schema,
} from 'effect';
import { categoryCodec, categoriesCodec } from '@/codecs';
import { CategoryProps } from '@/components/Categories/Categories';
import { iiifUri, stringifyJson, withBaseUrl } from '@/tools';
import {
  getCachedItems,
  getItemsTopUpPage,
  offsetFromTotalCachedAndLimit,
  retrieveIndividualItem,
} from '@/top-up/top-up';
import { CategorySnippet, Image } from '@/types';

const apiBasePath = 'https://api.prod.elifesciences.org/subjects';
const getCachedFilePath = '.cached/categories';
const getCachedListFile = `${getCachedFilePath}.json`;
const getCachedListFileNew = `${getCachedFilePath}-new.json`;
const getCachedFile = (id: string) => `${getCachedFilePath}/${id}.json`;

const retrieveIndividualCategory = retrieveIndividualItem(apiBasePath, categoryCodec);

const retrieveIndividualCategories = (
  categories: Array<{ id: string, path: string }>,
) => Effect.forEach(
  categories,
  retrieveIndividualCategory,
  {
    // this is the default, but you can be explicit:
    concurrency: 'unbounded',
  },
);

const categoriesTopUpPath = ({ limit = 10, page = 1 }: { limit?: number, page?: number } = {}): string => `${apiBasePath}?order=asc&page=${page}&per-page=${Math.min(limit, 100)}`;

const getCategoriesTotal = () => pipe(
  categoriesTopUpPath({ limit: 1 }),
  HttpClient.get,
  Effect.flatMap((response) => response.json),
  Effect.flatMap(Schema.decodeUnknown(Schema.Struct({ total: Schema.Int }))),
  Effect.map(({ total }) => total),
  Effect.catchAll(() => Effect.succeed(-1)),
);

const getCategoriesTopUpPage = (
  { limit, page = 1 }: { limit: number, page?: number },
) => getItemsTopUpPage(
  categoriesTopUpPath({ limit, page }),
  categoryCodec,
);

const getCachedCategories = getCachedItems(getCachedListFile, categoriesCodec);

const missingIndividualCategories = pipe(
  getCachedCategories(),
  Effect.map(Array.map(({ id }) => id)),
  Effect.flatMap((paths) => Effect.flatMap(FileSystem.FileSystem, (fs) => Effect.all(
    paths.map((id) => fs.exists(`${getCachedFilePath}/${id}.json`)
      .pipe(Effect.catchAll(() => Effect.succeed(false)))
      .pipe(Effect.map((exists) => ({ id, path: getCachedFile(id), exists })))),
  ))),
  Effect.map(
    (results) => results
      .filter(({ exists }) => !exists)
      .map(({ id, path }) => ({ id, path })),
  ),
);

const retrieveMissingIndividualCategories = () => pipe(
  missingIndividualCategories,
  Effect.flatMap(retrieveIndividualCategories),
);

const getCategoriesTopUp = ({ limit, offset = 0 }: { limit: number, offset?: number }) => pipe(
  offset > 0 ? Math.floor((offset + limit) / limit) : 1,
  (page) => [page, ...((page > 0 && offset % limit > 0) ? [page + 1] : [])],
  Array.map((page) => getCategoriesTopUpPage({ limit, page })),
  Effect.all,
  Effect.map((pages) => pages.flat()),
  Effect.map((results) => results.slice(offset % limit, (offset % limit) + limit)),
);

const categoriesTopUpWrite = ({ limit, total }: { limit: number, total?: number }) => pipe(
  getCachedCategories(),
  Effect.flatMap((cached) => getCategoriesTopUp(
    { limit, offset: offsetFromTotalCachedAndLimit(total ?? 0, cached.length, limit) },
  )),
  Effect.tap((categories) => Effect.log(`Topping up ${categories.length} Categories`)),
  Effect.tap((categories) => Effect.log(categories.map(({ id }) => id).reverse())),
  Effect.map((categories) => stringifyJson(categories)),
  Effect.tap(
    (categories) => Effect.flatMap(
      FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFileNew, categories),
    ),
  ),
);

const categoriesTopUpCombine = () => pipe(
  Effect.all([
    getCachedCategories(getCachedListFileNew),
    getCachedCategories(),
  ]),
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Effect.tap(([_, before]) => Effect.log(`Total before: ${before.length}`)),
  Effect.map((lists) => Array.appendAll(...lists)),
  Effect.map(Array.dedupeWith((a, b) => a.id === b.id)),
  Effect.map(
    Array.sort(
      Order.mapInput(Order.string, (item: CategorySnippet) => item.id),
    ),
  ),
  Effect.tap((after) => Effect.log(`Total after: ${after.length}`)),
  Effect.map((categories) => stringifyJson(categories)),
  Effect.tap(
    (categories) => Effect.flatMap(
      FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFile, categories),
    ),
  ),
);

const categoriesTopUpInvalidate = () => pipe(
  getCachedCategories(getCachedListFileNew),
  Effect.map(Array.map(({ id: msid }) => getCachedFile(msid))),
  Effect.flatMap((paths) => Effect.flatMap(
    FileSystem.FileSystem,
    (fs) => Effect.forEach(
      paths,
      (path) => fs.remove(path, { force: true }),
      { discard: true },
    ),
  )),
);

const categoriesTopUpTidyUp = () => Effect.flatMap(
  FileSystem.FileSystem,
  (fs) => fs.remove(getCachedListFileNew, { force: true }),
);

const createCacheFolder = () => Effect.flatMap(
  FileSystem.FileSystem,
  (fs) => fs.makeDirectory(getCachedFilePath, { recursive: true }),
);

export const categoriesTopUp = (
  { limit }: { limit: number },
): Effect.Effect<void, never, FileSystem.FileSystem | HttpClient.HttpClient> => pipe(
  createCacheFolder(),
  Effect.flatMap(getCategoriesTotal),
  Effect.flatMap((total) => categoriesTopUpWrite({ limit, total })),
  Effect.flatMap(categoriesTopUpInvalidate),
  Effect.flatMap(categoriesTopUpCombine),
  Effect.flatMap(categoriesTopUpTidyUp),
  Effect.flatMap(retrieveMissingIndividualCategories),
  Effect.catchAllCause(Effect.logError),
  Effect.asVoid,
);

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
  name: category.name,
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
): Effect.Effect<CategoryProps, PlatformError.PlatformError | ParseResult.ParseError, FileSystem.FileSystem> => pipe(
  Effect.flatMap(
    FileSystem.FileSystem,
    (fs) => fs.readFileString(getCachedFile(id)),
  ),
  Effect.map(JSON.parse),
  Effect.flatMap(Schema.decodeUnknown(categoryCodec)),
  Effect.map((category) => ({
    ...prepareCategorySnippet({
      image: category.image.banner,
      imageWidth,
      imageHeight,
    })(category),
  })),
);

export const getCategories = (
  {
    imageWidth,
    imageHeight,
  }: { imageWidth?: number, imageHeight?: number } = {},
): Effect.Effect<
ReadonlyArray<CategoryProps>,
PlatformError.PlatformError | ParseResult.ParseError,
FileSystem.FileSystem
> => pipe(
  Effect.flatMap(
    FileSystem.FileSystem,
    (fs) => fs.readFileString(getCachedListFile),
  ),
  Effect.catchAll(() => Effect.succeed('[]')),
  Effect.map(JSON.parse),
  Effect.flatMap(Schema.decodeUnknown(categoriesCodec)),
  Effect.map(Array.map((category) => ({
    ...prepareCategorySnippet({
      image: category.image.thumbnail,
      imageWidth,
      imageHeight,
    })(category),
  }))),
);
