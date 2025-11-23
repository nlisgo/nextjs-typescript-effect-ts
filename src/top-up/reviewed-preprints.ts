import { Error as PlatformError, FileSystem, HttpClient } from '@effect/platform';
import {
  Array, Effect, Order, ParseResult, pipe, Schema,
} from 'effect';
import { TeaserProps } from '@/components/Teasers/Teasers';
import { stringifyJson, withBaseUrl } from '@/tools';
import { getCachedItems, getItemsTopUpPage, retrieveIndividualItem } from '@/top-up/top-up';

const apiBasePath = 'https://api.prod.elifesciences.org/reviewed-preprints';
const getCachedFilePath = '.cached/reviewed-preprints';
const getCachedListFile = `${getCachedFilePath}.json`;
const getCachedListFileNew = `${getCachedFilePath}-new.json`;
const getCachedFile = (msid: string) => `${getCachedFilePath}/${msid}.json`;

const reviewedPreprintItemCodec = Schema.Struct({
  id: Schema.String,
  title: Schema.String,
  published: Schema.DateFromString,
  statusDate: Schema.DateFromString,
  hash: Schema.optional(Schema.String),
});

type ReviewedPreprint = Schema.Schema.Type<typeof reviewedPreprintItemCodec>;

const reviewedPreprintsCodec = Schema.Array(
  reviewedPreprintItemCodec,
);

const retrieveIndividualReviewedPreprint = retrieveIndividualItem(apiBasePath, reviewedPreprintItemCodec);

const retrieveIndividualReviewedPreprints = (
  reviewedPreprints: Array<{ msid: string, path: string }>,
) => pipe(
  reviewedPreprints.map(({ msid: id, path }) => ({ id, path })),
  Effect.forEach(
    retrieveIndividualReviewedPreprint,
    {
      // this is the default, but you can be explicit:
      concurrency: 'unbounded',
    },
  ),
);

const reviewedPreprintsTopUpPath = ({ limit = 10, page = 1 }: { limit?: number, page?: number } = {}): string => `${apiBasePath}?order=asc&page=${page}&per-page=${Math.min(limit, 100)}`;

const getReviewedPreprintsTopUpPage = (
  { limit, page = 1 }: { limit: number, page?: number },
) => getItemsTopUpPage(
  reviewedPreprintsTopUpPath({ limit, page }),
  reviewedPreprintItemCodec,
);

const getCachedReviewedPreprints = getCachedItems(getCachedListFile, reviewedPreprintsCodec);

const missingIndividualReviewedPreprints = pipe(
  getCachedReviewedPreprints(),
  Effect.map(Array.map(({ id: msid }) => msid)),
  Effect.flatMap((paths) => Effect.flatMap(FileSystem.FileSystem, (fs) => Effect.all(
    paths.map((msid) => fs.exists(`${getCachedFilePath}/${msid}.json`)
      .pipe(Effect.catchAll(() => Effect.succeed(false)))
      .pipe(Effect.map((exists) => ({ msid, path: getCachedFile(msid), exists })))),
  ))),
  Effect.map(
    (results) => results
      .filter(({ exists }) => !exists)
      .map(({ msid, path }) => ({ msid, path })),
  ),
);

const retrieveMissingIndividualReviewedPreprints = () => pipe(
  missingIndividualReviewedPreprints,
  Effect.flatMap(retrieveIndividualReviewedPreprints),
);

const getReviewedPreprintsTopUp = ({ limit, offset = 0 }: { limit: number, offset?: number }) => pipe(
  offset > 0 ? Math.floor((offset + limit) / limit) : 1,
  (page) => [page, ...((page > 0 && offset % limit > 0) ? [page + 1] : [])],
  Array.map((page) => getReviewedPreprintsTopUpPage({ limit, page })),
  Effect.all,
  Effect.map((pages) => pages.flat()),
  Effect.map((results) => results.slice(offset % limit, (offset % limit) + limit)),
);

const reviewedPreprintsTopUpWrite = ({ limit }: { limit: number }) => pipe(
  getCachedReviewedPreprints(),
  Effect.flatMap((cached) => getReviewedPreprintsTopUp({ limit, offset: cached.length })),
  Effect.map((reviewedPreprints) => stringifyJson(reviewedPreprints)),
  Effect.tap(
    (reviewedPreprints) => Effect.flatMap(
      FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFileNew, reviewedPreprints),
    ),
  ),
);

const reviewedPreprintsTopUpCombine = () => pipe(
  Effect.all([
    getCachedReviewedPreprints(),
    getCachedReviewedPreprints(getCachedListFileNew),
  ]),
  Effect.map((lists) => Array.appendAll(...lists)),
  Effect.map(Array.dedupeWith((a, b) => a.id === b.id)),
  Effect.map(
    Array.sort(
      Order.reverse(
        Order.mapInput(Order.number, (item) => item.statusDate.getTime()),
      ) as Order.Order<ReviewedPreprint>,
    ),
  ),
  Effect.map((reviewedPreprints) => stringifyJson(reviewedPreprints)),
  Effect.tap(
    (reviewedPreprints) => Effect.flatMap(
      FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFile, reviewedPreprints),
    ),
  ),
);

const reviewedPreprintsTopUpInvalidate = () => pipe(
  getCachedReviewedPreprints(getCachedListFileNew),
  Effect.map(Array.map(({ id: msid }) => getCachedFile(msid))),
  Effect.flatMap((paths) => Effect.flatMap(
    FileSystem.FileSystem,
    (fs) => Effect.forEach(
      paths,
      (path) => fs.remove(path, { force: true }),
      { discard: true },
    ),
  )),
);

const reviewedPreprintsTopUpTidyUp = () => Effect.flatMap(
  FileSystem.FileSystem,
  (fs) => fs.remove(getCachedListFileNew, { force: true }),
);

const createCacheFolder = () => Effect.flatMap(
  FileSystem.FileSystem,
  (fs) => fs.makeDirectory(getCachedFilePath, { recursive: true }),
);

export const reviewedPreprintsTopUp = (
  { limit }: { limit: number },
): Effect.Effect<void, never, FileSystem.FileSystem | HttpClient.HttpClient> => pipe(
  createCacheFolder(),
  Effect.flatMap(() => reviewedPreprintsTopUpWrite({ limit })),
  Effect.flatMap(reviewedPreprintsTopUpInvalidate),
  Effect.flatMap(reviewedPreprintsTopUpCombine),
  Effect.flatMap(reviewedPreprintsTopUpTidyUp),
  Effect.flatMap(retrieveMissingIndividualReviewedPreprints),
  Effect.catchAllCause(Effect.logError),
  Effect.asVoid,
);

const prepareTeaser = (reviewedPreprint: ReviewedPreprint): TeaserProps => ({
  id: reviewedPreprint.id,
  published: reviewedPreprint.statusDate,
  title: reviewedPreprint.title,
  uri: withBaseUrl(`/reviewed-preprints/${reviewedPreprint.id}`),
  description: 'Authors et al.',
});

export const getReviewedPreprint = (
  { id }: { id: string },
): Effect.Effect<TeaserProps, PlatformError.PlatformError | ParseResult.ParseError, FileSystem.FileSystem> => pipe(
  Effect.flatMap(
    FileSystem.FileSystem,
    (fs) => fs.readFileString(getCachedFile(id)),
  ),
  Effect.map(JSON.parse),
  Effect.flatMap(Schema.decodeUnknown(reviewedPreprintItemCodec)),
  Effect.map(prepareTeaser),
);

export const getReviewedPreprints = (): Effect.Effect<
ReadonlyArray<TeaserProps>,
PlatformError.PlatformError | ParseResult.ParseError,
FileSystem.FileSystem
> => pipe(
  Effect.flatMap(
    FileSystem.FileSystem,
    (fs) => fs.readFileString(getCachedListFile),
  ),
  Effect.catchAll(() => Effect.succeed('[]')),
  Effect.map(JSON.parse),
  Effect.flatMap(Schema.decodeUnknown(reviewedPreprintsCodec)),
  Effect.map(Array.map(prepareTeaser)),
);
