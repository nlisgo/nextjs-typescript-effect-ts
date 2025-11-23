import {
  Error as PlatformError,
  FileSystem,
  HttpClient,
  HttpClientError,
} from '@effect/platform';
import {
  Effect, ParseResult, pipe, Schema,
} from 'effect';
import { stringifyJson } from '@/tools';

export const retrieveIndividualItem = <A, I = unknown, Req = never>(
  basePath: string,
  schema: Schema.Schema<A, I, Req>,
) => ({ id, path }: { id: string, path: string }): Effect.Effect<
  A,
  HttpClientError.HttpClientError | ParseResult.ParseError | PlatformError.PlatformError,
  Req | HttpClient.HttpClient | FileSystem.FileSystem
  > => pipe(
    HttpClient.get(`${basePath}/${id}`),
    Effect.flatMap((response) => response.json),
    Effect.flatMap(Schema.decodeUnknown(schema)),
    Effect.tap((result) => Effect.flatMap(
      FileSystem.FileSystem,
      (fs) => fs.writeFileString(path, stringifyJson(result)),
    )),
  );
