import { FetchHttpClient } from '@effect/platform';
import { Effect, Either, pipe } from 'effect';
import { Metadata } from 'next';
import { JSX } from 'react';
import { Categories } from '@/components/Categories/Categories';
import { Highlights } from '@/components/Highlights/Highlights';
import { Page } from '@/components/Page/Page';
import { Teasers } from '@/components/Teasers/Teasers';
import { getCategories, getHighlights, getReviewedPreprints } from '@/queries';
import { withBaseUrl } from '@/tools';

export const metadata: Metadata = {
  title: 'Home | Acme',
};

const Home = async (): Promise<JSX.Element> => Effect.runPromise(pipe(
  Effect.all([
    getHighlights({ imageWidth: 463, imageHeight: 260 }).pipe(
      Effect.map(Either.fromNullable(() => new Error('no highlights found'))),
      Effect.flatMap(Either.map((highs) => <section key="highlights"><Highlights title="Highlights" highlights={[...highs]} /></section>)),
    ),
    getCategories({ imageWidth: 80, imageHeight: 80 }).pipe(
      Effect.map(Either.fromNullable(() => new Error('no categories found'))),
      Effect.flatMap(Either.map((cats) => <section key="categories"><Categories uri={withBaseUrl('/categories')} title="Categories" categories={[...cats]} /></section>)),
    ),
    getReviewedPreprints({ limit: 10 }).pipe(
      Effect.map(Either.fromNullable(() => new Error('no categories found'))),
      Effect.flatMap(Either.map((rps) => <section key="reviewed-preprints"><Teasers uri={withBaseUrl('/reviewed-preprints')} title="Recent Reviewed Preprints" teasers={[...rps]} /></section>)),
    ),
  ]),
  Effect.map((sections) => <Page>{sections}</Page>),
).pipe(
  Effect.provide(FetchHttpClient.layer),
));

export default Home;
