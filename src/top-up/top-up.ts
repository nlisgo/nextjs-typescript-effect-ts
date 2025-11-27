import {
  FileSystem,
  HttpClient,
  HttpClientError,
  HttpClientRequest,
  Error as PlatformError,
  HttpClientResponse,
} from '@effect/platform';
import { createHash } from 'crypto';
import { Array, Effect, ParseResult, pipe, Schema } from 'effect';
import { stringifyJson } from '@/tools';

export const is404 = (error: unknown): boolean =>
  HttpClientError.isHttpClientError(error) && error._tag === 'ResponseError' && error.response.status === 404;

export const createItemHash = (item: unknown) => createHash('md5').update(stringifyJson(item, false)).digest('hex');

export const retrieveIndividualItemRequestOnly = (
  basePath: string,
  id: string,
): Effect.Effect<
  Record<string, unknown>,
  HttpClientError.HttpClientError | ParseResult.ParseError,
  HttpClient.HttpClient
> =>
  pipe(
    HttpClientRequest.get(`${basePath}/${id}`),
    HttpClient.execute,
    Effect.flatMap(HttpClientResponse.filterStatus((status) => status !== 404)),
    Effect.flatMap((res) => res.json),
    Effect.flatMap(Schema.decodeUnknown(Schema.Record({ key: Schema.String, value: Schema.Unknown }))),
  );

export const retrieveIndividualItem =
  <A, I = unknown, Req = never>(basePath: string, schema: Schema.Schema<A, I, Req>, addTo: object = {}) =>
  ({
    id,
    path,
  }: {
    id: string;
    path: string;
  }): Effect.Effect<
    A,
    HttpClientError.HttpClientError | ParseResult.ParseError | PlatformError.PlatformError,
    Req | HttpClient.HttpClient | FileSystem.FileSystem
  > =>
    pipe(
      retrieveIndividualItemRequestOnly(basePath, id),
      Effect.flatMap(Schema.decodeUnknown(schema)),
      Effect.tap((result) =>
        Effect.flatMap(FileSystem.FileSystem, (fs) => fs.writeFileString(path, stringifyJson({ ...addTo, ...result }))),
      ),
    );

export const getItemsTopUpPage = <A, I = unknown, Req = never>(
  itemsTopUpPath: string,
  itemSchema: Schema.Schema<A, I, Req>,
  filter: boolean = false,
): Effect.Effect<
  ReadonlyArray<A & { hash: string }>,
  HttpClientError.HttpClientError | ParseResult.ParseError,
  Req | HttpClient.HttpClient
> =>
  pipe(
    Effect.succeed(itemsTopUpPath),
    Effect.tap(Effect.log),
    Effect.flatMap(HttpClient.get),
    Effect.flatMap((res) => res.json),
    Effect.flatMap(Schema.decodeUnknown(Schema.Struct({ items: Schema.Array(Schema.Unknown) }))),
    Effect.map(({ items }) => items),
    Effect.flatMap((items) =>
      filter
        ? Effect.all(items.map((item) => pipe(Schema.decodeUnknown(itemSchema)(item), Effect.option))).pipe(
            Effect.map(Array.filterMap((option) => option)),
          )
        : Effect.all(
            items.map((item) => Schema.decodeUnknown(itemSchema)(item)),
            { concurrency: 'unbounded' },
          ),
    ),
    Effect.map(
      Array.map((item) => ({
        ...item,
        hash: createItemHash(item),
      })),
    ),
  );

export const getCachedItems =
  <A, I = unknown, Req = never>(defaultFile: string, schema: Schema.Schema<A, I, Req>) =>
  (
    file?: string,
  ): Effect.Effect<A, ParseResult.ParseError | PlatformError.PlatformError, Req | FileSystem.FileSystem> =>
    pipe(
      Effect.flatMap(FileSystem.FileSystem, (fs) => fs.readFileString(file ?? defaultFile)),
      Effect.catchAll(() => Effect.succeed('[]')),
      Effect.map((input) => JSON.parse(input) as unknown),
      Effect.flatMap(Schema.decodeUnknown(schema)),
    );

export const offsetFromTotalCachedAndLimit = (total: number, cached: number, limit: number): number => {
  if (total > 0 && total <= cached + limit) {
    return Math.max(0, total - limit);
  }

  return cached;
};
