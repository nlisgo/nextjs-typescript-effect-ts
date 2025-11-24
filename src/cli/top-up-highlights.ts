#!/usr/bin/env node
import { CliConfig, Command } from '@effect/cli';
import { FetchHttpClient } from '@effect/platform';
import { NodeContext, NodeFileSystem, NodeRuntime } from '@effect/platform-node';
import { Effect } from 'effect';
import { highlightsTopUp } from '@/top-up/highlights';

const command = Command.make('top-up-categories', {}, () => highlightsTopUp());

const cliApp = Command.run(command, {
  name: 'top-up-highlights',
  version: '0.1.0',
});

const AppLayer = [
  NodeFileSystem.layer,
  NodeContext.layer,
  CliConfig.layer({
    showBuiltIns: false,
  }),
  FetchHttpClient.layer,
] as const;

cliApp(process.argv).pipe(
  Effect.provide(AppLayer),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
