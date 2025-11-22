import * as fs from 'fs';
import * as path from 'path';

import {
  Array, Effect, pipe,
} from 'effect';
import { Metadata } from 'next';
import { type JSX } from 'react';
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
      Effect.map(([preprints]) => preprints),
      Effect.map((preprints) => {
        const previousOutDir = path.join(process.cwd(), '.previous-out');
        if (!fs.existsSync(previousOutDir)) {
          return preprints;
        }

        return preprints.filter((preprint) => {
          const htmlPath = path.join(previousOutDir, 'reviewed-preprints', preprint.id, 'index.html');
          const exists = fs.existsSync(htmlPath);
          if (exists) {
            console.log(`[Incremental Build] Skipping existing page: reviewed-preprints/${preprint.id}`);
          }
          return !exists;
        });
      }),
      Effect.map(Array.map((preprint) => ({ msid: preprint.id }))),
    ).pipe(
      Effect.provide(MainLayer),
    ),
  );
};

const ReviewedPreprintPage = async ({ params }: PageProps): Promise<JSX.Element> => Effect.runPromise(
  pipe(
    Effect.promise(async () => params),
    Effect.tap(({ msid }) => Effect.sync(() => console.log(`[Page Generation] Building Reviewed Preprint: ${msid}`))),
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
