#!/usr/bin/env node
import { Command, Options } from '@effect/cli';
import {Error as PlatformError, HttpClient} from '@effect/platform';
import { NodeRuntime } from '@effect/platform-node';
import {Array, Effect, ParseResult, pipe, Schema} from 'effect';
import { CliMainLayer } from '@/services/CliRuntime';
import {
  getCachedReviewedPreprintsMsids,
  getReviewedPreprintsMsids,
  pruneReviewedPreprints,
  purgeReviewedPreprints,
} from '@/top-up/reviewed-preprints';

const optionLimit = Options.integer('limit').pipe(
  Options.withAlias('l'),
  Options.withSchema(Schema.Int.pipe(Schema.between(1, 100))),
  Options.withDefault(50),
);

const calibrateReviewedPreprints = ({ limit }: { limit: number }): Effect.Effect<{ api: Array<string>, cached: Array<string> }, PlatformError.PlatformError | ParseResult.ParseError, FileSystem.FileSystem | HttpClient.HttpClient>> =>
  pipe(
    Effect.all([getReviewedPreprintsMsids({ limit }), getCachedReviewedPreprintsMsids]),
    Effect.map(([api, cached]) => ({
      api: Array.difference(api, cached),
      cached: Array.difference(cached, api),
    })),
    Effect.tap(({ api }) => (api.length > 0 ? pruneReviewedPreprints(api) : Effect.log('Nothing to prune'))),
    Effect.tap(({ cached }) => (cached.length > 0 ? purgeReviewedPreprints(cached) : Effect.log('Nothing to purge'))),
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
