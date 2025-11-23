import { createHash } from 'crypto';
import { Error as PlatformError, FileSystem, HttpClient } from '@effect/platform';
import {
  Array, Effect, Order, ParseResult, pipe, Schema,
} from 'effect';
import { CategoryProps } from '@/components/Categories/Categories';
import { withBaseUrl } from '@/tools';

const apiBasePath = 'https://api.prod.elifesciences.org/subjects';
const getCachedFilePath = '.cached/categories';
const getCachedListFile = `${getCachedFilePath}.json`;
const getCachedListFileNew = `${getCachedFilePath}-new.json`;
const getCachedFile = (id: string) => `${getCachedFilePath}/${id}.json`;

const stringifyJson = (
  data: unknown,
  formatted: boolean = true,
) => JSON.stringify(data, undefined, formatted ? 2 : undefined);

const categoryItemCodec = Schema.Struct({
  id: Schema.String,
  name: Schema.String,
  impactStatement: Schema.String,
  hash: Schema.optional(Schema.String),
});

type Category = Schema.Schema.Type<typeof categoryItemCodec>;

const categoriesCodec = Schema.Array(
  categoryItemCodec,
);

const paginatedCategoriesCodec = Schema.Struct({
  total: Schema.Number,
  items: categoriesCodec,
});

const retrieveIndividualCategory = ({ id, path }: { id: string, path: string }) => pipe(
  HttpClient.get(`${apiBasePath}/${id}`),
  Effect.flatMap((response) => response.json),
  Effect.flatMap(Schema.decodeUnknown(categoryItemCodec)),
  Effect.tap((result) => Effect.flatMap(
    FileSystem.FileSystem,
    (fs) => fs.writeFileString(path, stringifyJson(result)),
  )),
);

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

const getCategoriesTopUpPage = ({ limit, page = 1 }: { limit: number, page?: number }) => pipe(
  Effect.succeed(categoriesTopUpPath({ limit, page })),
  Effect.tap(Effect.log),
  Effect.flatMap(HttpClient.get),
  Effect.flatMap((res) => res.json),
  Effect.flatMap(Schema.decodeUnknown(paginatedCategoriesCodec)),
  Effect.map((response) => response.items),
  Effect.map(Array.map((item) => ({
    ...item,
    hash: createHash('md5').update(stringifyJson(item, false)).digest('hex'),
  }))),
);

const getCachedCategories = (file?: string) => pipe(
  Effect.flatMap(FileSystem.FileSystem, (fs) => fs.readFileString(file ?? getCachedListFile)),
  Effect.flatMap((input) => Effect.try({
    try: () => JSON.parse(input) as unknown,
    catch: (error) => new Error(`Invalid JSON: ${stringifyJson(error, false)}`),
  })),
  Effect.catchAll(() => Effect.succeed([])),
  Effect.flatMap(Schema.decodeUnknown(categoriesCodec)),
);

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

const categoriesTopUpWrite = ({ limit }: { limit: number }) => pipe(
  getCachedCategories(),
  Effect.flatMap((cached) => getCategoriesTopUp({ limit, offset: cached.length })),
  Effect.map((categories) => stringifyJson(categories)),
  Effect.tap(
    (categories) => Effect.flatMap(
      FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFileNew, categories),
    ),
  ),
);

const categoriesTopUpCombine = () => pipe(
  Effect.all([
    getCachedCategories(),
    getCachedCategories(getCachedListFileNew),
  ]),
  Effect.map((lists) => Array.appendAll(...lists)),
  Effect.map(Array.dedupeWith((a, b) => a.id === b.id)),
  Effect.map(
    Array.sort(
      Order.mapInput(Order.string, (item) => item.id) as Order.Order<Category>,
    ),
  ),
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
  Effect.flatMap(() => categoriesTopUpWrite({ limit })),
  Effect.flatMap(categoriesTopUpInvalidate),
  Effect.flatMap(categoriesTopUpCombine),
  Effect.flatMap(categoriesTopUpTidyUp),
  Effect.flatMap(retrieveMissingIndividualCategories),
  Effect.catchAllCause(Effect.logError),
  Effect.asVoid,
);

export const getCategory = (
  { id }: { id: string },
): Effect.Effect<CategoryProps, PlatformError.PlatformError | ParseResult.ParseError, FileSystem.FileSystem> => pipe(
  Effect.flatMap(
    FileSystem.FileSystem,
    (fs) => fs.readFileString(getCachedFile(id)),
  ),
  Effect.map(JSON.parse),
  Effect.flatMap(Schema.decodeUnknown(categoryItemCodec)),
  Effect.map((category) => ({
    id: category.id,
    name: category.name,
    uri: withBaseUrl(`/categories/${category.id}`),
    description: 'Description',
  })),
);

export const getCategories = (): Effect.Effect<
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
    id: category.id,
    name: category.name,
    uri: withBaseUrl(`/categories/${category.id}`),
    description: 'Description',
  }))),
);
