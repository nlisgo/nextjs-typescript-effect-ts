import { Array, Effect, pipe } from 'effect';
import { Metadata } from 'next';
import { type JSX } from 'react';
import { CategoryTags } from '@/components/Categories/Categories';
import { Page } from '@/components/Page/Page';
import { Title } from '@/components/Title/Title';
import { MainLayer } from '@/services/AppRuntime';
import { titleContentToText } from '@/tools';
import { getReviewedPreprint, getReviewedPreprints } from '@/top-up/reviewed-preprints';

type PageProps = {
  params: {
    msid: string;
  };
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> =>
  Effect.runPromise(
    pipe(
      Effect.promise(async () => params),
      Effect.flatMap(({ msid: id }) => getReviewedPreprint({ id })),
      Effect.map((rp) => ({
        title: titleContentToText(rp.title),
      })),
    ).pipe(Effect.provide(MainLayer)),
  );

// Static params required for `output: "export"`. Update this list with real reviewedPreprint IDs.
export const dynamicParams = false;

export const generateStaticParams = async (): Promise<Array<{ msid: string }>> => {
  console.log('Generating static params for reviewed preprints...');
  return Effect.runPromise(
    pipe(getReviewedPreprints(), Effect.map(Array.map(({ id: msid }) => ({ msid })))).pipe(Effect.provide(MainLayer)),
  );
};

const ReviewedPreprintPage = async ({ params }: PageProps): Promise<JSX.Element> =>
  Effect.runPromise(
    pipe(
      Effect.promise(async () => params),
      Effect.tap(({ msid }) => Effect.sync(() => console.log(`[Page Generation] Building Reviewed Preprint: ${msid}`))),
      Effect.flatMap(({ msid: id }) => getReviewedPreprint({ id })),
      (foo) => foo,
      Effect.map((reviewedPreprint) => (
        <Page>
          {reviewedPreprint.categories && <CategoryTags categories={reviewedPreprint.categories} />}
          <h1>
            <Title content={reviewedPreprint.title} />
          </h1>
          <p>{reviewedPreprint.description}</p>
          {reviewedPreprint.published && (
            <time dateTime={reviewedPreprint.published.toISOString()}>{reviewedPreprint.published.toDateString()}</time>
          )}
        </Page>
      )),
    ).pipe(Effect.provide(MainLayer)),
  );

export default ReviewedPreprintPage;
