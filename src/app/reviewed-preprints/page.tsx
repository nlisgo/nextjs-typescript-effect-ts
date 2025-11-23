import { Effect, Either } from 'effect';
import { Metadata } from 'next';
import type { JSX } from 'react';
import { Page } from '@/components/Page/Page';
import { Teasers } from '@/components/Teasers/Teasers';
import { MainLayer } from '@/services/AppRuntime';
import { getReviewedPreprints } from '@/top-up/reviewed-preprints';

export const metadata: Metadata = {
  title: 'Reviewed Preprints',
};

const ReviewedPreprintsPage = async (): Promise<JSX.Element> => Effect.runPromise(
  getReviewedPreprints().pipe(
    Effect.map(Either.fromNullable(() => new Error('no reviewed preprints found'))),
    Effect.flatMap(Either.map((rps) => <Page><section key="reviewed-preprints"><Teasers title="Reviewed Preprints" teasers={[...rps]} /></section></Page>)),
  ).pipe(
    Effect.provide(MainLayer),
  ),
);

export default ReviewedPreprintsPage;
