import { Args, Command } from '@effect/cli';
import { Effect, pipe } from 'effect';
import { CliMainLayer } from '@/services/CliRuntime';
import { NodeRuntime } from '@effect/platform-node';
import { FileSystem } from '@effect/platform';
import { NoSuchElementException } from 'effect/Cause';

const getFilenameFromRegistry = (registry: string) =>
  pipe(
    registry.match(/([^/]+)\.([^/]+)$/),
    Effect.fromNullable,
    Effect.map(([, stub, ext]) => ({
      name: `${stub}.${ext}`,
      stub,
      ext,
      path: registry,
    })),
    Effect.catchTag(
      'NoSuchElementException',
      () => new NoSuchElementException(`Could not parse filename: ${registry}`),
    ),
  );

const argCacheRegistry = Args.text({ name: 'Cache registry' });

const command = Command.make('backup-cached', { registry: argCacheRegistry }, ({ registry }) =>
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
    Effect.tap(Effect.log),
    Effect.tap((file) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) =>
        fs.remove(file.stub, { recursive: true }).pipe(Effect.catchAll(() => Effect.void)),
      ),
    ),
    Effect.tap((file) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) => fs.makeDirectory(file.stub, { recursive: true })),
    ),
    Effect.catchAllCause(Effect.logError),
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
