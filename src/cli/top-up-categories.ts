#!/usr/bin/env node
import { CliConfig, Command, Options } from '@effect/cli';
import { FetchHttpClient } from '@effect/platform';
import { NodeContext, NodeFileSystem, NodeRuntime } from '@effect/platform-node';
import { Effect, Schema } from 'effect';
import { categoriesTopUp } from '@/top-up/categories';

const optionLimit = Options.integer('limit')
  .pipe(
    Options.withAlias('l'),
    Options.withSchema(Schema.Int.pipe(Schema.between(1, 100))),
    Options.withDefault(30),
  );

const command = Command.make(
  'top-up-categories',
  { limit: optionLimit },
  ({ limit }) => categoriesTopUp({ limit }),
);

const cliApp = Command.run(command, {
  name: 'top-up-categories',
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

cliApp(process.argv)
  .pipe(
    Effect.provide(AppLayer),
    NodeRuntime.runMain({
      disableErrorReporting: true,
    }),
  );
