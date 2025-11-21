import {
  Array, Effect, pipe,
} from 'effect';
import { Metadata } from 'next';
import { type JSX } from 'react';
import { eppReviewedPreprintPath } from '@/api-paths';
import { CategoryTags } from '@/components/Categories/Categories';
import { Content } from '@/components/Content/Content';
import { Page } from '@/components/Page/Page';
import { Title } from '@/components/Title/Title';
import { getReviewedPreprint, getReviewedPreprints } from '@/queries';
import { getContinuumReviewedPreprint } from '@/queries/reviewed-preprints';
import { MainLayer } from '@/services/AppRuntime';
import { CacheServiceTag } from '@/services/PersistentCache';
import { titleContentToText } from '@/tools';

type PageProps = {
  params: {
    msid: string,
  },
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => Effect.runPromise(
  pipe(
    Effect.promise(async () => params),
    Effect.flatMap(({ msid: id }) => getReviewedPreprint({ id })),
    Effect.map((rp) => ({
      title: titleContentToText(rp.title),
    })),
  ).pipe(
    Effect.provide(MainLayer),
  ),
);

// Static params required for `output: "export"`. Update this list with real reviewedPreprint IDs.
export const dynamicParams = false;

export const generateStaticParams = async (): Promise<Array<{ msid: string }>> => {
  console.log('Generating static params for reviewed preprints...');
  return Effect.runPromise(
    pipe(
      Effect.all([getReviewedPreprints(), CacheServiceTag]),
      Effect.flatMap(([preprints, cache]) => {
        console.log(`Found ${preprints.length} preprints`);
        return Effect.forEach(preprints, (preprint) => Effect.map(
          cache.has(eppReviewedPreprintPath(preprint.id)),
          (exists) => ({
            msid: preprint.id,
            exists,
          }),
        ));
      }),
      Effect.map((items) => {
        const nonCached = items.filter((item) => !item.exists);
        if (nonCached.length === 0 && items.length > 0) {
          console.log('All items cached. Regenerating the first one to satisfy Next.js build.');
          return [items[0]];
        }
        if (nonCached.length < items.length) {
          console.log(`Skipping ${items.length - nonCached.length} cached preprints.`);
        }
        return nonCached;
      }),
      Effect.map(Array.map(({ msid }) => ({ msid }))),
    ).pipe(
      Effect.provide(MainLayer),
    ),
  );
};

const ReviewedPreprintPage = async ({ params }: PageProps): Promise<JSX.Element> => Effect.runPromise(
  pipe(
    Effect.promise(async () => params),
    Effect.flatMap(({ msid: id }) => Effect.all([
      getContinuumReviewedPreprint({ id }),
      getReviewedPreprint({ id }),
    ])),
    Effect.map(
      ([rpContinuum, rpEpp]) => (
        <Page>
          {rpContinuum.categories
            && <CategoryTags categories={rpContinuum.categories} />}
          <h1><Title content={rpEpp.title} /></h1>
          <p>{rpContinuum.description}</p>
          {rpContinuum.published
            && <time dateTime={rpContinuum.published.toISOString()}>{rpContinuum.published.toDateString()}</time>}
          <h2>Evaluation Summary</h2>
          <Content content={rpContinuum.evaluationSummary} />
        </Page>
      ),
    ),
  ).pipe(
    Effect.provide(MainLayer),
  ),
);

export default ReviewedPreprintPage;
