import { FetchHttpClient } from '@effect/platform';
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
    Effect.provide(FetchHttpClient.layer),
  ),
);

// Static params required for `output: "export"`. Update this list with real reviewedPreprint IDs.
export const dynamicParams = false;

export const generateStaticParams = async (): Promise<Array<{ msid: string }>> => Effect.runPromise(
  pipe(
    getReviewedPreprints(),
    Effect.map(Array.map(({ id: msid }) => ({ msid }))),
  ).pipe(
    Effect.provide(FetchHttpClient.layer),
  ),
);

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
    Effect.provide(FetchHttpClient.layer),
  ),
);

export default ReviewedPreprintPage;
