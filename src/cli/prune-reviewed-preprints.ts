#!/usr/bin/env node
import { Args, Command } from '@effect/cli';
import { NodeRuntime } from '@effect/platform-node';
import { Array, Effect, pipe, Schema } from 'effect';
import { CliMainLayer } from '@/services/CliRuntime';
import { pruneReviewedPreprints } from '@/top-up/reviewed-preprints';

const argMsids = Args.text({ name: 'Comma separated MSIDs' });

const command = Command.make('prune-reviewed-preprints', { msids: argMsids }, ({ msids }) =>
  pipe(
    msids.split(/\s*,\s*/).map((msid) => msid.trim()),
    Array.filter(Schema.is(Schema.String.pipe(Schema.pattern(/^[0-9]+$/)))),
    pruneReviewedPreprints,
  ),
);

const cliApp = Command.run(command, {
  name: 'prune-reviewed-preprints',
  version: '0.1.0',
});

cliApp(process.argv).pipe(
  Effect.provide(CliMainLayer),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
