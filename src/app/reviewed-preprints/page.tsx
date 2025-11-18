import { FetchHttpClient } from '@effect/platform';
import { Effect, Either } from 'effect';
import { Metadata } from 'next';
import type { JSX } from 'react';
import { Page } from '@/components/Page/Page';
import { Teasers } from '@/components/Teasers/Teasers';
import { getReviewedPreprints } from '@/queries';

export const metadata: Metadata = {
  title: 'Reviewed Preprints',
};

const ReviewedPreprintsPage = async (): Promise<JSX.Element> => <Page>
  {
    Effect.runPromise(getReviewedPreprints({ limit: 20 }).pipe(
      Effect.map(Either.fromNullable(() => new Error('no reviewed preprints found'))),
      Effect.flatMap(Either.map((rps) => <section key="reviewed-preprints"><Teasers title="Reviewed Preprints" teasers={[...rps]} /></section>)),
    ).pipe(
      Effect.provide(FetchHttpClient.layer),
    ))
  }
</Page>;

export default ReviewedPreprintsPage;
