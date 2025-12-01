import {Args, Command, Options} from '@effect/cli';
import { Array, Chunk, Effect, Option, pipe, Schema, Stream } from 'effect';
import { CliMainLayer } from '@/services/CliRuntime';
import { NodeRuntime } from '@effect/platform-node';
import { Command as ProcCommand, FileSystem, HttpClient, HttpClientRequest } from '@effect/platform';
import { NoSuchElementException } from 'effect/Cause';

const downloadFile = (url: string, folder: string) =>
  pipe(
    HttpClientRequest.get(url),
    (request) =>
      pipe(
        HttpClient.HttpClient,
        Effect.flatMap((client) => client.execute(request)),
      ),
    Effect.flatMap((response) =>
      pipe(
        response.stream,
        Stream.runCollect,
        Effect.map((chunks) => {
          const arrayChunks = Chunk.toReadonlyArray(chunks);
          const totalLength = arrayChunks.reduce((acc, chunk) => acc + chunk.length, 0);
          const result = new Uint8Array(totalLength);
          let offset = 0;
          for (const chunk of arrayChunks) {
            result.set(chunk, offset);
            offset += chunk.length;
          }
          return result;
        }),
        Effect.flatMap((data) =>
          Effect.flatMap(FileSystem.FileSystem, (fs) =>
            pipe(
              getFilenameFromRegistry(url),
              Effect.flatMap(({ name }) => fs.writeFile(`${folder}/${name}`, data)),
            ),
          ),
        ),
      ),
    ),
  );

const getFilenameFromRegistry = (registry: string) =>
  pipe(
    registry.match(/([^/]+)\.([^/]+)$/),
    Effect.fromNullable,
    Effect.map(([, stub, ext]) => ({
      name: `${stub}.${ext}`,
      stub,
      dest: stub.replace(/\.7z$/, ''),
      ext,
      path: registry,
    })),
    Effect.catchTag(
      'NoSuchElementException',
      () => new NoSuchElementException(`Could not parse filename: ${registry}`),
    ),
  );

const optionOutput = Options.text('output').pipe(Options.withAlias('o'), Options.optional);

const argCacheRegistry = Args.text({ name: 'Cache registry' });

const command = Command.make('backup-cached', { registry: argCacheRegistry, output: optionOutput }, ({ registry, output }) =>
  pipe(
    registry,
    getFilenameFromRegistry,
    Effect.flatMap((file) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) =>
        fs.readFileString(file.path).pipe(
          Effect.map((files) => ({
            ...file,
            contents: JSON.parse(files),
          })),
        ),
      ),
    ),
    Effect.flatMap(
      Schema.decodeUnknown(
        Schema.Struct({
          name: Schema.String,
          stub: Schema.String,
          dest: Schema.String,
          ext: Schema.String,
          path: Schema.String,
          contents: Schema.NonEmptyArray(Schema.String),
        }),
      ),
    ),
    Effect.tap((file) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) =>
        fs.remove(file.stub, { recursive: true }).pipe(Effect.catchAll(() => Effect.void)),
      ),
    ),
    Effect.tap((file) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) => fs.makeDirectory(file.stub, { recursive: true })),
    ),
    Effect.tap(({ stub: folder, contents: backups }) =>
      Effect.all(backups.map((backup) => downloadFile(backup, folder))),
    ),
    Effect.flatMap(({ stub: folder, contents: backups }) =>
      pipe(
        Effect.forEach(backups, (backup) => getFilenameFromRegistry(backup)),
        Effect.map(Array.map(({ name, dest }) => ({ name, dest }))),
        Effect.flatMap(
          Array.findFirst(
            Schema.is(
              Schema.Struct({
                name: Schema.String.pipe(Schema.pattern(/\.7z\.001$/)),
                dest: Schema.String,
              }),
            ),
          ),
        ),
        Effect.tap(({ dest }) =>
          Effect.flatMap(FileSystem.FileSystem, (fs) =>
            fs.remove(dest, { recursive: true }).pipe(Effect.catchAll(() => Effect.void)),
          ),
        ),
        Effect.map(({ name, dest }) =>
          pipe(
            ProcCommand.make('bash', '-c', `7z x ./${folder}/${name} -o${Option.isSome(output) ? output.value : `./${dest}`}`),
            ProcCommand.stdout('inherit'),
            ProcCommand.stderr('inherit'),
          ),
        ),
        Effect.flatMap(ProcCommand.exitCode),
        Effect.tapErrorCause(Effect.logError),
        Effect.flatMap((exitCode) =>
          exitCode === 0
            ? Effect.succeed(exitCode)
            : Effect.fail(new Error(`Command failed with exit code ${exitCode}`)),
        ),
      ),
    ),
    Effect.tapErrorCause(Effect.logError),
  ),
);

const cliApp = Command.run(command, {
  name: 'restore-cached',
  version: '0.1.0',
});

cliApp(process.argv).pipe(
  Effect.provide(CliMainLayer),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
