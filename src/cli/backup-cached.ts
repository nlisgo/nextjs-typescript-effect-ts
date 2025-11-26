#!/usr/bin/env node
import { Args, Command, Options } from '@effect/cli';
import { NodeRuntime } from '@effect/platform-node';
import { Array, Effect, Option, pipe } from 'effect';
import { CliMainLayer } from '@/services/CliRuntime';
import { FileSystem, Command as ProcCommand, HttpClient, HttpClientRequest } from '@effect/platform';
import { stringifyJson } from '@/tools';

const outputFile = (output: Option.Option<string>, fallback: string) =>
  Option.isSome(output) ? output.value : fallback;

const optionOutput = Options.text('output').pipe(Options.withAlias('o'), Options.optional);

const argCacheFolder = Args.text({ name: 'Cache folder' });

const cached7zFolder = (cached: string) => `${cached}-7z`;

const localFilePath = (filename: string, folder?: string) => `${folder ? `${folder}/` : ''}${filename}`;

const uploadFile = (filename: string, folder?: string) =>
  pipe(
    FileSystem.FileSystem,
    Effect.flatMap((fs) => fs.readFile(localFilePath(filename, folder))),
    Effect.map((bytes) =>
      pipe(HttpClientRequest.put(`https://transfer.whalebone.io/${filename}`), HttpClientRequest.bodyUint8Array(bytes)),
    ),
    Effect.flatMap((request) => Effect.flatMap(HttpClient.HttpClient, (client) => client.execute(request))),
    Effect.flatMap((response) => response.text),
  );

const compressCached = (cached: string) =>
  pipe(
    Effect.flatMap(FileSystem.FileSystem, (fs) =>
      fs.remove(cached7zFolder(cached), { recursive: true }).pipe(Effect.catchAll(() => Effect.void)),
    ),
    Effect.flatMap(() => Effect.flatMap(FileSystem.FileSystem, (fs) => fs.readDirectory(cached))),
    Effect.catchAllCause(Effect.logError),
    Effect.map(() =>
      ProcCommand.make('bash', '-lc', `cd ${cached} && 7z a -r -v50m ../${cached7zFolder(cached)}/${cached}.7z *`),
    ),
    Effect.map(ProcCommand.stdout('inherit')),
    Effect.map(ProcCommand.stderr('inherit')),
    Effect.flatMap(ProcCommand.exitCode),
  );

const command = Command.make('backup-cached', { folder: argCacheFolder, output: optionOutput }, ({ folder, output }) =>
  pipe(
    folder,
    Effect.succeed,
    Effect.tap(compressCached),
    Effect.flatMap((cached) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) =>
        fs.readDirectory(cached7zFolder(cached)).pipe(
          Effect.map(
            Array.map((filename) => ({
              folder: cached7zFolder(cached),
              filename,
            })),
          ),
        ),
      ),
    ),
    Effect.flatMap((cacheFiles) => Effect.all(cacheFiles.map(({ folder, filename }) => uploadFile(filename, folder)))),
    Effect.tap(Effect.log),
    Effect.map(stringifyJson),
    Effect.flatMap((out) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) =>
        fs.writeFileString(outputFile(output, `${cached7zFolder(folder)}.json`), out),
      ),
    ),
  ),
);

const cliApp = Command.run(command, {
  name: 'backup-cached',
  version: '0.1.0',
});

cliApp(process.argv).pipe(
  Effect.provide(CliMainLayer),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
