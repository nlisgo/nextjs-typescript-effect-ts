import { Error as PlatformError, FileSystem, HttpClient } from '@effect/platform';
import {
  Array, Effect, ParseResult, pipe, Schema,
} from 'effect';
import { highlightCodec, highlightsCodec } from '@/codecs';
import { HighlightProps } from '@/components/Highlights/Highlights';
import { iiifUri, stringifyJson } from '@/tools';
import { getItemsTopUpPage } from '@/top-up/top-up';

const apiBasePath = 'https://api.prod.elifesciences.org/covers/current';
const getCachedFilePath = '.cached';
const getCachedListFile = `${getCachedFilePath}/highlights.json`;

const getHighlightsTopUpPage = () => getItemsTopUpPage(
  apiBasePath,
  highlightCodec,
  true,
);

const highlightsTopUpWrite = () => pipe(
  getHighlightsTopUpPage(),
  Effect.tap((after) => Effect.log(`Total after: ${after.length}`)),
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

export const getHighlights = (
  {
    imageWidth,
    imageHeight,
  }: { imageWidth?: number, imageHeight?: number } = {},
): Effect.Effect<
ReadonlyArray<HighlightProps>,
PlatformError.PlatformError | ParseResult.ParseError,
FileSystem.FileSystem
> => pipe(
  Effect.flatMap(
    FileSystem.FileSystem,
    (fs) => fs.readFileString(getCachedListFile),
  ),
  Effect.catchAll(() => Effect.succeed('[]')),
  Effect.map(JSON.parse),
  Effect.flatMap(Schema.decodeUnknown(highlightsCodec)),
  Effect.map(Array.map((highlight) => ({
    title: highlight.title,
    uri: `https://doi.org/${highlight.item.doi}`,
    image: {
      uri: iiifUri(
        highlight.image,
        imageWidth ?? 463,
        imageHeight ?? 260,
      ),
      alt: highlight.image.alt,
      width: imageWidth ?? 463,
      height: imageHeight ?? 260,
    },
    description: highlight.impactStatement,
  }))),
);
