import { Effect, Either } from 'effect';
import { Metadata } from 'next';
import type { JSX } from 'react';
import { Categories } from '@/components/Categories/Categories';
import { Page } from '@/components/Page/Page';
import { AppMainLayer } from '@/services/AppRuntime';
import { getCategories } from '@/top-up/categories';

export const metadata: Metadata = {
  title: 'Categories',
};

const CategoriesPage = async (): Promise<JSX.Element> =>
  Effect.runPromise(
    getCategories()
      .pipe(
        Effect.map(Either.fromNullable(() => new Error('no categories found'))),
        Effect.flatMap(
          Either.map((cats) => (
            <Page>
              <section key="categories">
                <Categories title="Categories" categories={[...cats]} />
              </section>
            </Page>
          )),
        ),
      )
      .pipe(Effect.provide(AppMainLayer)),
  );

export default CategoriesPage;
