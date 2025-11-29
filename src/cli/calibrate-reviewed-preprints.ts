#!/usr/bin/env node
import { Command, Options } from '@effect/cli';
import { NodeRuntime } from '@effect/platform-node';
import { Effect, Schema } from 'effect';
import { CliMainLayer } from '@/services/CliRuntime';
import { calibrateReviewedPreprints } from '@/top-up/reviewed-preprints';

const optionLimit = Options.integer('limit').pipe(
  Options.withAlias('l'),
  Options.withSchema(Schema.Int.pipe(Schema.between(1, 100))),
  Options.withDefault(50),
);

const command = Command.make('calibrate-reviewed-preprints', { limit: optionLimit }, ({ limit }) =>
  calibrateReviewedPreprints({ limit }),
);

const cliApp = Command.run(command, {
  name: 'calibrate-reviewed-preprints',
  version: '0.1.0',
});

cliApp(process.argv).pipe(
  Effect.provide(CliMainLayer),
  NodeRuntime.runMain({
    disableErrorReporting: true,
  }),
);
