import { FileSystem, HttpClient } from '@effect/platform';
import { Effect, pipe } from 'effect';
import { highlightCodec } from '@/codecs';
import { stringifyJson } from '@/tools';
import { getItemsTopUpPage } from '@/top-up/top-up';

const apiBasePath = 'https://api.prod.elifesciences.org/covers/current';
const getCachedFilePath = '.cached';
const getCachedListFile = `${getCachedFilePath}/covers.json`;

const getHighlightsTopUpPage = () => getItemsTopUpPage(
  apiBasePath,
  highlightCodec,
  true,
);

const highlightsTopUpWrite = () => pipe(
  getHighlightsTopUpPage(),
  Effect.map(stringifyJson),
  Effect.tap(
    (highlights) => Effect.flatMap(
      FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFile, highlights),
    ),
  ),
);

const createCacheFolder = () => Effect.flatMap(
  FileSystem.FileSystem,
  (fs) => fs.makeDirectory(getCachedFilePath, { recursive: true }),
);

export const highlightsTopUp = (): Effect.Effect<void, never, FileSystem.FileSystem | HttpClient.HttpClient> => pipe(
  createCacheFolder(),
  Effect.flatMap(highlightsTopUpWrite),
  Effect.catchAllCause(Effect.logError),
  Effect.asVoid,
);
