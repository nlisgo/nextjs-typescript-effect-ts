import { Command } from '@effect/cli';
import { Effect } from 'effect';
import { CliMainLayer } from '@/services/CliRuntime';
import { NodeRuntime } from '@effect/platform-node';

const command = Command.make('backup-cached', {}, () => Effect.succeed('backup-cached'));

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
