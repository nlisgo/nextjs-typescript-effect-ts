#!/usr/bin/env node
import { Command, Options } from '@effect/cli';
import { NodeRuntime } from '@effect/platform-node';
import { Effect, Schema } from 'effect';
import { categoriesTopUp } from '@/top-up/categories';
import { CliMainLayer } from '@/services/CliRuntime';

const optionLimit = Options.integer('limit').pipe(
  Options.withAlias('l'),
  Options.withSchema(Schema.Int.pipe(Schema.between(1, 100))),
  Options.withDefault(30),
);

const command = Command.make('top-up-categories', { limit: optionLimit }, ({ limit }) => categoriesTopUp({ limit }));

const cliApp = Command.run(command, {
  name: 'top-up-categories',
  version: '0.1.0',
});

cliApp(process.argv).pipe(
  Effect.provide(CliMainLayer),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
