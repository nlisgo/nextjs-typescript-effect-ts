import { FetchHttpClient } from '@effect/platform';
import {
  Array, Effect, pipe,
} from 'effect';
import { Metadata } from 'next';
import type { JSX } from 'react';
import { Page } from '@/components/Page/Page';
import { getReviewedPreprint, getReviewedPreprints } from '@/queries';

type PageProps = {
  params: {
    msid: string,
  },
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { msid } = await params;
  return Effect.runPromise(
    pipe(
      getReviewedPreprint({ id: msid }),
      Effect.map((rp) => ({
        title: rp.title,
      })),
    ).pipe(
      Effect.provide(FetchHttpClient.layer),
    ),
  );
};

// Static params required for `output: "export"`. Update this list with real reviewedPreprint IDs.
export const dynamicParams = false;

export const generateStaticParams = async (): Promise<Array<{ msid: string }>> => Effect.runPromise(
  pipe(
    getReviewedPreprints(),
    Effect.map(Array.map((reviewedPreprint) => ({ msid: reviewedPreprint.id }))),
  ).pipe(
    Effect.provide(FetchHttpClient.layer),
  ),
);

const ReviewedPreprintPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { msid } = await params;
  return (
    <Page>
      {
        Effect.runPromise(
          pipe(
            getReviewedPreprint({ id: msid }),
            Effect.map(
              (rp) => (
                <>
                  <h1 dangerouslySetInnerHTML={{
                    __html: rp.title,
                  }} />
                </>
              ),
            ),
          ).pipe(
            Effect.provide(FetchHttpClient.layer),
          ),
        )
      }
    </Page>
  );
};

export default ReviewedPreprintPage;
