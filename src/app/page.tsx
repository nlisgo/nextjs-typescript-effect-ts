import { FetchHttpClient } from '@effect/platform';
import { Effect, Either } from 'effect';
import { Metadata } from 'next';
import { JSX } from 'react';
import { Categories } from '@/components/Categories/Categories';
import { Highlights } from '@/components/Highlights/Highlights';
import { Page } from '@/components/Page/Page';
import { Teasers } from '@/components/Teasers/Teasers';
import { getCategories, getHighlights, getReviewedPreprints } from '@/queries';
import { withBaseUrl } from '@/tools';

export const generateMetadata = async (): Promise<Metadata> => ({
  title: 'Home | Acme',
});

const Home = (): JSX.Element => <Page>
  {
    Effect.runPromise(Effect.all([
      getHighlights({ imageWidth: 463, imageHeight: 260 }).pipe(
        Effect.map(Either.fromNullable(() => new Error('no highlights found'))),
        Effect.flatMap(Either.map((highs) => <section key="highlights"><Highlights title="Highlights" highlights={[...highs]} /></section>)),
      ),
      getCategories({ imageWidth: 80, imageHeight: 80 }).pipe(
        Effect.map(Either.fromNullable(() => new Error('no categories found'))),
        Effect.flatMap(Either.map((cats) => <section key="categories"><Categories uri={withBaseUrl('/categories')} title="Categories" categories={[...cats]} /></section>)),
      ),
      getReviewedPreprints().pipe(
        Effect.map(Either.fromNullable(() => new Error('no categories found'))),
        Effect.flatMap(Either.map((rps) => <section key="reviewed-preprints"><Teasers uri={withBaseUrl('/reviewed-preprints')} title="Recent Reviewed Preprints" teasers={[...rps]} /></section>)),
      ),
    ]).pipe(
      Effect.provide(FetchHttpClient.layer),
    ))
  }
</Page>;

export default Home;
