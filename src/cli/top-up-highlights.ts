#!/usr/bin/env node
import { Command } from '@effect/cli';
import { NodeRuntime } from '@effect/platform-node';
import { Effect } from 'effect';
import { highlightsTopUp } from '@/top-up/highlights';
import { CliMainLayer } from '@/services/CliRuntime';

const command = Command.make('top-up-categories', {}, () => highlightsTopUp());

const cliApp = Command.run(command, {
  name: 'top-up-highlights',
  version: '0.1.0',
});

cliApp(process.argv).pipe(
  Effect.provide(CliMainLayer),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
