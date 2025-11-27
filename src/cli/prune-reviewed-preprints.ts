#!/usr/bin/env node
import { Args, Command } from '@effect/cli';
import { NodeRuntime } from '@effect/platform-node';
import { Array, Effect, pipe, Schema } from 'effect';
import { CliMainLayer } from '@/services/CliRuntime';
import { FileSystem } from '@effect/platform';
import {
  createCacheFolder,
  getCachedFile,
  getCachedListFileNew,
  retrieveIndividualReviewedPreprints,
  reviewedPreprintsTopUpCombine,
  reviewedPreprintsTopUpTidyUp,
} from '@/top-up/reviewed-preprints';
import { reviewedPreprintCodec } from '@/codecs';
import { stringifyJson } from '@/tools';
import { createItemHash } from '@/top-up/top-up';

const argMsids = Args.text({ name: 'Comma separated MSIDs' });

const command = Command.make('prune-reviewed-preprints', { msids: argMsids }, ({ msids }) =>
  pipe(
    msids.split(/\s*,\s*/).map((msid) => msid.trim()),
    Array.filter(Schema.is(Schema.String.pipe(Schema.pattern(/^[0-9]+$/)))),
    Effect.succeed,
    Effect.map(Array.map((msid) => ({ msid, path: getCachedFile(msid) }))),
    Effect.tap((msids) =>
      Effect.forEach(msids, ({ path }) =>
        Effect.flatMap(FileSystem.FileSystem, (fs) => fs.remove(path).pipe(Effect.catchAll(() => Effect.void))),
      ),
    ),
    Effect.tap(() => createCacheFolder()),
    Effect.flatMap((msids) =>
      pipe(
        retrieveIndividualReviewedPreprints(msids),
        Effect.catchAll((error) => {
          // Log the error but continue - some MSIDs might 404
          return Effect.log(`Some MSIDs failed to retrieve (possibly 404): ${JSON.stringify(error)}`);
        }),
        Effect.map(() => msids),
      ),
    ),
    Effect.flatMap((msids) =>
      Effect.forEach(
        msids,
        (rp) =>
          Effect.flatMap(FileSystem.FileSystem, (fs) =>
            fs.readFileString(rp.path).pipe(
              Effect.map(JSON.parse),
              Effect.flatMap(Schema.decodeUnknown(reviewedPreprintCodec)),
              Effect.map(({ article, ...snippet }) => ({
                ...snippet,
                hash: createItemHash(snippet),
              })),
              Effect.option, // Convert failures to None
            ),
          ),
        { concurrency: 'unbounded' },
      ).pipe(Effect.map(Array.filterMap((option) => option))),
    ),
    Effect.map(stringifyJson),
    Effect.tap((reviewedPreprints) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFileNew, reviewedPreprints)),
    ),
    Effect.tap(() => reviewedPreprintsTopUpCombine()),
    Effect.tap(() => reviewedPreprintsTopUpTidyUp()),
    Effect.tapErrorCause(Effect.logError),
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
