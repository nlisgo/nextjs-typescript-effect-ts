#!/usr/bin/env node
import { Args, Command } from '@effect/cli';
import { NodeRuntime } from '@effect/platform-node';
import { Effect, pipe } from 'effect';
import { CliMainLayer } from '@/services/CliRuntime';
import { cleanMsidsCommaSeparated, purgeReviewedPreprints } from '@/top-up/reviewed-preprints';

const argMsids = Args.text({ name: 'Comma separated MSIDs' });

const command = Command.make('purge-reviewed-preprints', { msids: argMsids }, ({ msids }) =>
  pipe(msids, cleanMsidsCommaSeparated, purgeReviewedPreprints),
);

const cliApp = Command.run(command, {
  name: 'purge-reviewed-preprints',
  version: '0.1.0',
});

cliApp(process.argv).pipe(
  Effect.provide(CliMainLayer),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
