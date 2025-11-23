import { Effect, Either, pipe } from 'effect';
import { Metadata } from 'next';
import { JSX } from 'react';
import { Categories } from '@/components/Categories/Categories';
import { Page } from '@/components/Page/Page';
import { Teasers } from '@/components/Teasers/Teasers';
import { MainLayer } from '@/services/AppRuntime';
import { withBaseUrl } from '@/tools';
import { getCategories } from '@/top-up/categories';
import { getReviewedPreprints } from '@/top-up/reviewed-preprints';

export const metadata: Metadata = {
  title: 'Home | Acme',
};

const Home = async (): Promise<JSX.Element> => Effect.runPromise(pipe(
  Effect.all([
    getCategories().pipe(
      Effect.map(Either.fromNullable(() => new Error('no categories found'))),
      Effect.flatMap(Either.map((cats) => <section key="categories"><Categories uri={withBaseUrl('/categories')} title="Categories" categories={cats} /></section>)),
    ),
    getReviewedPreprints().pipe(
      Effect.map(Either.fromNullable(() => new Error('no reviewed preprints found'))),
      Effect.flatMap(Either.map((rps) => <section key="reviewed-preprints"><Teasers uri={withBaseUrl('/reviewed-preprints')} title="Recent Reviewed Preprints" teasers={rps.slice(0, 10)} /></section>)),
    ),
  ]),
  Effect.map((sections) => <Page>{sections}</Page>),
).pipe(
  Effect.provide(MainLayer),
));

export default Home;
