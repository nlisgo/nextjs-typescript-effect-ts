import { FileSystem, HttpClient, Error as PlatformError } from '@effect/platform';
import { Array, Effect, Option, Order, ParseResult, pipe, Ref, Schedule, Schema } from 'effect';
import { TeaserProps } from '@/components/Teasers/Teasers';
import { stringifyJson, withBaseUrl } from '@/tools';
import {
  createItemHash,
  getCachedItems,
  getItemsTopUpPage,
  isResponseErrorWithStatusCode404,
  offsetFromTotalCachedAndLimit,
  retrieveIndividualItem,
} from '@/top-up/top-up';
import { reviewedPreprintCodec, reviewedPreprintsCodec } from '@/codecs';

const apiBasePath = 'https://api.prod.elifesciences.org/reviewed-preprints';
const apiBasePathEpp = 'https://prod--epp.elifesciences.org/api/preprints';
const getCachedFilePath = '.cached/reviewed-preprints';
const getCachedListFile = `${getCachedFilePath}.json`;
export const getCachedListFileNew = `${getCachedFilePath}-new.json`;
export const getCachedFile = (msid: string) => `${getCachedFilePath}/${msid}.json`;

type ReviewedPreprint = Schema.Schema.Type<typeof reviewedPreprintCodec>;

const retrySchedule = Schedule.exponential('2 seconds').pipe(Schedule.intersect(Schedule.recurs(7)), Schedule.jittered);

const retrieveIndividualReviewedPreprint = (
  item: {
    id: string;
    path: string;
    total?: number;
    position?: number;
  },
  completionCounter: Ref.Ref<number>,
) =>
  pipe(
    item,
    retrieveIndividualItem(apiBasePath, reviewedPreprintCodec),
    Effect.flatMap((firstResult) =>
      pipe(item, retrieveIndividualItem(apiBasePathEpp, Schema.Struct({ article: Schema.Unknown }), firstResult)),
    ),
    Effect.tap(() =>
      pipe(
        Ref.updateAndGet(completionCounter, (n) => n + 1),
        Effect.flatMap((completionOrder) =>
          Effect.log(
            `Retrieved individual Reviewed Preprint: ${item.id} - (${completionOrder}${item.total ? ` of ${item.total}` : ''})${item.position ? ` #${item.position}` : ''}`,
          ),
        ),
      ),
    ),
    Effect.tapError((error) =>
      Effect.log(`Failed to retrieve reviewed preprint ${item.id} will retry: ${stringifyJson(error, true)}`),
    ),
  );

export const retrieveIndividualReviewedPreprints = (reviewedPreprints: Array<{ msid: string; path: string }>) =>
  pipe(
    Ref.make(0),
    Effect.flatMap((completionCounter) =>
      Effect.all(
        reviewedPreprints.map(({ msid: id, path }, i) =>
          pipe(
            retrieveIndividualReviewedPreprint(
              { id, path, total: reviewedPreprints.length, position: i + 1 },
              completionCounter,
            ),
            Effect.retry({
              schedule: retrySchedule,
              while: (error) => !isResponseErrorWithStatusCode404(error),
            }),
            Effect.catchIf(isResponseErrorWithStatusCode404, () =>
              pipe(Effect.log(`Skipping 404 for ${id}`), Effect.as(Option.none<void>())),
            ),
            Effect.option,
          ),
        ),
        { concurrency: 100 },
      ),
    ),
    Effect.map(Array.getSomes),
  );

const reviewedPreprintsTopUpPath = ({
  limit = 10,
  page = 1,
}: {
  limit?: number;
  page?: number;
} = {}): string => `${apiBasePath}?order=asc&page=${page}&per-page=${Math.min(limit, 100)}`;

export const getReviewedPreprintsTotal = (): Effect.Effect<number, never, HttpClient.HttpClient> =>
  pipe(
    reviewedPreprintsTopUpPath({ limit: 1 }),
    HttpClient.get,
    Effect.flatMap((response) => response.json),
    Effect.flatMap(Schema.decodeUnknown(Schema.Struct({ total: Schema.Int }))),
    Effect.map(({ total }) => total),
    Effect.retry(retrySchedule),
    Effect.tapError((error) => Effect.log(`Failed to get total after retries: ${stringifyJson(error)}`)),
    Effect.catchAll(() => Effect.succeed(-1)),
  );

const getReviewedPreprintsTopUpPage = ({ limit, page = 1 }: { limit: number; page?: number }) =>
  pipe(
    getItemsTopUpPage(reviewedPreprintsTopUpPath({ limit, page }), reviewedPreprintCodec),
    Effect.retry(retrySchedule),
    Effect.tapError((error) => Effect.log(`Failed to get page ${page} after retries: ${stringifyJson(error)}`)),
  );

const getCachedReviewedPreprints = getCachedItems(getCachedListFile, reviewedPreprintsCodec);

export const getReviewedPreprintsMsids = ({
  limit,
  page = 1,
  addTo = [],
}: {
  limit: number;
  page?: number;
  addTo?: Array<string>;
}): Effect.Effect<Array<string>, never, HttpClient.HttpClient> =>
  pipe(
    { limit, page },
    getReviewedPreprintsTopUpPage,
    Effect.map(Array.map(({ id: msid }) => msid)),
    Effect.flatMap((msids) =>
      msids.length === limit
        ? getReviewedPreprintsMsids({ limit, page: page + 1, addTo: Array.prependAll(addTo)(msids) })
        : Effect.succeed(Array.prependAll(addTo)(msids)),
    ),
    Effect.catchAll(() => Effect.succeed<Array<string>>([])),
  );

export const getCachedReviewedPreprintsMsids: Effect.Effect<Array<string>, never, FileSystem.FileSystem> = pipe(
  getCachedReviewedPreprints(),
  Effect.map(Array.map(({ id }) => id)),
  Effect.catchAll(() => Effect.succeed<Array<string>>([])),
);

const missingIndividualReviewedPreprints = pipe(
  getCachedReviewedPreprints(),
  Effect.map(Array.map(({ id: msid }) => msid)),
  Effect.flatMap((paths) =>
    Effect.flatMap(FileSystem.FileSystem, (fs) =>
      Effect.all(
        paths.map((msid) =>
          fs
            .exists(`${getCachedFilePath}/${msid}.json`)
            .pipe(Effect.catchAll(() => Effect.succeed(false)))
            .pipe(
              Effect.map((exists) => ({
                msid,
                path: getCachedFile(msid),
                exists,
              })),
            ),
        ),
      ),
    ),
  ),
  Effect.map((results) => results.filter(({ exists }) => !exists).map(({ msid, path }) => ({ msid, path }))),
);

const retrieveMissingIndividualReviewedPreprints = () =>
  pipe(
    missingIndividualReviewedPreprints,
    Effect.tap((rps) => Effect.log(`Retrieving ${rps.length} missing individual Reviewed Preprints`)),
    Effect.flatMap(retrieveIndividualReviewedPreprints),
  );

const getReviewedPreprintsTopUp = ({ limit, offset = 0 }: { limit: number; offset?: number }) =>
  pipe(
    offset > 0 ? Math.floor((offset + limit) / limit) : 1,
    (page) => [page, ...(page > 0 && offset % limit > 0 ? [page + 1] : [])],
    Array.map((page) => getReviewedPreprintsTopUpPage({ limit, page })),
    Effect.all,
    Effect.map((pages) => pages.flat()),
    Effect.map((results) => results.slice(offset % limit, (offset % limit) + limit)),
  );

const reviewedPreprintsTopUpWrite = ({ limit, total }: { limit: number; total?: number }) =>
  pipe(
    getCachedReviewedPreprints(),
    Effect.flatMap((cached) =>
      getReviewedPreprintsTopUp({
        limit,
        offset: offsetFromTotalCachedAndLimit(total ?? 0, cached.length, limit),
      }),
    ),
    Effect.tap((reviewedPreprints) => Effect.log(`Topping up ${reviewedPreprints.length} Reviewed Preprints`)),
    Effect.tap((reviewedPreprints) => Effect.log(reviewedPreprints.map(({ id }) => id).reverse())),
    Effect.map((reviewedPreprints) => stringifyJson(reviewedPreprints)),
    Effect.tap((reviewedPreprints) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFileNew, reviewedPreprints)),
    ),
  );

export const reviewedPreprintsTopUpCombine = () =>
  pipe(
    Effect.all([getCachedReviewedPreprints(getCachedListFileNew), getCachedReviewedPreprints()]),
    Effect.tap(([, before]) => Effect.log(`Total before: ${before.length}`)),
    Effect.map((lists) => Array.appendAll(...lists)),
    Effect.map(Array.dedupeWith((a, b) => a.id === b.id)),
    Effect.map(
      Array.sort(
        Order.reverse(
          Order.mapInput(Order.number, (item) => (item.statusDate ? item.statusDate.getTime() : 0)),
        ) as Order.Order<ReviewedPreprint>,
      ),
    ),
    Effect.tap((after) => Effect.log(`Total after: ${after.length}`)),
    Effect.map((reviewedPreprints) => stringifyJson(reviewedPreprints)),
    Effect.tap((reviewedPreprints) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFile, reviewedPreprints)),
    ),
  );

const reviewedPreprintsTopUpInvalidate = () =>
  pipe(
    getCachedReviewedPreprints(getCachedListFileNew),
    Effect.map(Array.map(({ id: msid }) => getCachedFile(msid))),
    Effect.flatMap((paths) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) =>
        Effect.forEach(paths, (path) => fs.remove(path, { force: true }), {
          discard: true,
        }),
      ),
    ),
  );

export const reviewedPreprintsTopUpTidyUp = () =>
  Effect.flatMap(FileSystem.FileSystem, (fs) => fs.remove(getCachedListFileNew, { force: true }));

export const createCacheFolder = () =>
  Effect.flatMap(FileSystem.FileSystem, (fs) => fs.makeDirectory(getCachedFilePath, { recursive: true }));

const reviewedPreprintsTopUpOnePass = ({ limit, total }: { limit: number; total: number }) =>
  pipe(
    reviewedPreprintsTopUpWrite({ limit, total }),
    Effect.flatMap(reviewedPreprintsTopUpInvalidate),
    Effect.flatMap(reviewedPreprintsTopUpCombine),
    Effect.flatMap(reviewedPreprintsTopUpTidyUp),
    Effect.flatMap(() => getCachedReviewedPreprints()),
    Effect.map((cached) => total - cached.length),
  );

const reviewedPreprintsTopUpLoop = ({
  limit,
  total,
  remaining,
  all,
}: {
  limit: number;
  total: number;
  remaining?: number;
  all: boolean;
}): Effect.Effect<number, never, FileSystem.FileSystem | HttpClient.HttpClient> =>
  pipe(
    reviewedPreprintsTopUpOnePass({ limit, total }),
    Effect.flatMap((remainingAfterPass) =>
      all && remainingAfterPass < (remaining ?? total) && remainingAfterPass > 0
        ? pipe(
            Effect.log(`Remaining: ${remainingAfterPass}. Continuing...`),
            Effect.flatMap(() => reviewedPreprintsTopUpLoop({ limit, total, all, remaining: remainingAfterPass })),
          )
        : pipe(
            Effect.log(`Remaining: ${remainingAfterPass}. Done.`),
            Effect.map(() => remainingAfterPass),
          ),
    ),
    Effect.tapErrorCause(Effect.logError),
    Effect.orElseSucceed(() => 0),
  );

export const reviewedPreprintsTopUp = ({
  limit,
  all = false,
}: {
  limit: number;
  all?: boolean;
}): Effect.Effect<void, never, FileSystem.FileSystem | HttpClient.HttpClient> =>
  pipe(
    createCacheFolder(),
    Effect.catchAllCause(Effect.logError),
    Effect.flatMap(getReviewedPreprintsTotal),
    Effect.flatMap((total) => reviewedPreprintsTopUpLoop({ limit, total, all })),
    Effect.tap(retrieveMissingIndividualReviewedPreprints),
    Effect.tap((remaining) => remaining > 0 )
    Effect.catchAllCause(Effect.logError),
    Effect.asVoid,
  );

const prepareTeaser = (reviewedPreprint: ReviewedPreprint): TeaserProps => ({
  id: reviewedPreprint.id,
  published: reviewedPreprint.statusDate,
  title: reviewedPreprint.title,
  uri: withBaseUrl(`/reviewed-preprints/${reviewedPreprint.id}`),
  description: reviewedPreprint.authorLine ?? 'Authors et al.',
  categories: reviewedPreprint.subjects,
});

export const getReviewedPreprint = ({
  id,
}: {
  id: string;
}): Effect.Effect<TeaserProps, PlatformError.PlatformError | ParseResult.ParseError, FileSystem.FileSystem> =>
  pipe(
    Effect.flatMap(FileSystem.FileSystem, (fs) => fs.readFileString(getCachedFile(id))),
    Effect.map(JSON.parse),
    Effect.flatMap(Schema.decodeUnknown(reviewedPreprintCodec)),
    Effect.map(prepareTeaser),
  );

export const getReviewedPreprints = (): Effect.Effect<
  ReadonlyArray<TeaserProps>,
  PlatformError.PlatformError | ParseResult.ParseError,
  FileSystem.FileSystem
> =>
  pipe(
    Effect.flatMap(FileSystem.FileSystem, (fs) => fs.readFileString(getCachedListFile)),
    Effect.catchAll(() => Effect.succeed('[]')),
    Effect.map(JSON.parse),
    Effect.flatMap(Schema.decodeUnknown(reviewedPreprintsCodec)),
    Effect.map(Array.map(prepareTeaser)),
  );

export const purgeReviewedPreprints = (msidsToPurge: Array<string>) =>
  pipe(
    msidsToPurge,
    Effect.succeed,
    Effect.map(Array.map((msid) => ({ msid, path: getCachedFile(msid) }))),
    Effect.tap((msids) =>
      Effect.forEach(msids, ({ path }) =>
        Effect.flatMap(FileSystem.FileSystem, (fs) => fs.remove(path).pipe(Effect.catchAll(() => Effect.void))),
      ),
    ),
    Effect.flatMap(() => getCachedReviewedPreprints()),
    Effect.tap(() => Effect.log(`Purging: ${msidsToPurge.join(', ')}`)),
    Effect.tap((before) => Effect.log(`Total before: ${before.length}`)),
    Effect.map(Array.filter(({ id: msid }) => !msidsToPurge.includes(msid))),
    Effect.tap((after) => Effect.log(`Total after: ${after.length}`)),
    Effect.map(stringifyJson),
    Effect.tap((reviewedPreprints) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFile, reviewedPreprints)),
    ),
  );

export const pruneReviewedPreprints = (
  msids: Array<string>,
): Effect.Effect<
  string,
  PlatformError.PlatformError | ParseResult.ParseError,
  FileSystem.FileSystem | HttpClient.HttpClient
> =>
  pipe(
    msids,
    Effect.succeed,
    Effect.map(Array.map((msid) => ({ msid, path: getCachedFile(msid) }))),
    Effect.tap((msids) =>
      Effect.forEach(msids, ({ path }) =>
        Effect.flatMap(FileSystem.FileSystem, (fs) => fs.remove(path).pipe(Effect.catchAll(() => Effect.void))),
      ),
    ),
    Effect.tap(() => createCacheFolder()),
    Effect.tap(retrieveIndividualReviewedPreprints),
    Effect.flatMap((msids) =>
      Effect.forEach(msids, (rp) =>
        Effect.flatMap(FileSystem.FileSystem, (fs) =>
          fs.readFileString(rp.path).pipe(
            Effect.map(JSON.parse),
            Effect.flatMap(Schema.decodeUnknown(reviewedPreprintCodec)),
            Effect.map(({ article, ...snippet }) => ({
              ...snippet,
              hash: createItemHash(snippet),
            })),
            Effect.option,
          ),
        ),
      ),
    ),
    Effect.map(Array.getSomes),
    Effect.map(stringifyJson),
    Effect.tap((reviewedPreprints) =>
      Effect.flatMap(FileSystem.FileSystem, (fs) => fs.writeFileString(getCachedListFileNew, reviewedPreprints)),
    ),
    Effect.tap(() => reviewedPreprintsTopUpCombine()),
    Effect.tap(() => reviewedPreprintsTopUpTidyUp()),
    Effect.tapErrorCause(Effect.logError),
  );
