import { FetchHttpClient } from '@effect/platform';
import { Effect, Either } from 'effect';
import { Metadata } from 'next';
import type { JSX } from 'react';
import { Categories } from '@/components/Categories/Categories';
import { Page } from '@/components/Page/Page';
import { getCategories } from '@/queries/categories';

export const metadata: Metadata = {
  title: 'Categories',
};

const CategoriesPage = async (): Promise<JSX.Element> => <Page>
  {
    Effect.runPromise(getCategories({ imageWidth: 80, imageHeight: 80 }).pipe(
      Effect.map(Either.fromNullable(() => new Error('no categories found'))),
      Effect.flatMap(Either.map((cats) => <section key="categories"><Categories title="Categories" categories={[...cats]} /></section>)),
    ).pipe(
      Effect.provide(FetchHttpClient.layer),
    ))
  }
</Page>;

export default CategoriesPage;
