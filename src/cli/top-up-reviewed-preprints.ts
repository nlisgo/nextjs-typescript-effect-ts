#!/usr/bin/env node
import { Command, Options } from '@effect/cli';
import { NodeRuntime } from '@effect/platform-node';
import { Effect, Schema } from 'effect';
import { reviewedPreprintsTopUp } from '@/top-up/reviewed-preprints';
import { CliMainLayer } from '@/services/CliRuntime';

const optionLimit = Options.integer('limit').pipe(
  Options.withAlias('l'),
  Options.withSchema(Schema.Int.pipe(Schema.between(1, 100))),
  Options.withDefault(50),
);

const optionAll = Options.boolean('all').pipe(Options.withAlias('a'));

const optionCalibrate = Options.boolean('calibrate').pipe(Options.withAlias('c'));

const command = Command.make(
  'top-up-reviewed-preprints',
  { limit: optionLimit, all: optionAll, calibrate: optionCalibrate },
  ({ limit, all, calibrate }) => reviewedPreprintsTopUp({ limit, all, calibrate }),
);

const cliApp = Command.run(command, {
  name: 'top-up-reviewed-preprints',
  version: '0.1.0',
});

cliApp(process.argv).pipe(
  Effect.provide(CliMainLayer),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
