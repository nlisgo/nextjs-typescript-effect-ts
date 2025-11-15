import { FetchHttpClient } from '@effect/platform';
import { Effect, Either } from 'effect';
import { JSX } from 'react';
import { Categories } from '@/components/Categories/Categories';
import { Highlights } from '@/components/Highlights/Highlights';
import { Page } from '@/components/Page/Page';
import { getCategories } from '@/queries/categories';
import { getHighlights } from '@/queries/highlights';

const Home = (): JSX.Element => <Page>
  {
    Effect.runPromise(Effect.all([
      getHighlights({ imageWidth: 463, imageHeight: 260 }).pipe(
        Effect.map(Either.fromNullable(() => new Error('no highlights'))),
        Effect.flatMap(Either.map((highs) => <section key="highlights"><Highlights title="Highlights" highlights={[...highs]} /></section>)),
      ),
      getCategories({ imageWidth: 80, imageHeight: 80 }).pipe(
        Effect.map(Either.fromNullable(() => new Error('no categories'))),
        Effect.flatMap(Either.map((cats) => <section key="categories"><Categories title="Categories" categories={[...cats]} /></section>)),
      ),
    ]).pipe(
      Effect.provide(FetchHttpClient.layer),
    ))
  }
</Page>;

export default Home;
