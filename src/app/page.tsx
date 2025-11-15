import { FetchHttpClient } from '@effect/platform';
import { Effect } from 'effect';
import { JSX } from 'react';
import { Categories } from '@/components/Categories/Categories';
import { Highlights } from '@/components/Highlights/Highlights';
import { Page } from '@/components/Page/Page';
import { getCategories } from '@/queries/categories';
import { getHighlights } from '@/queries/highlights';

export default async function Home(): Promise<JSX.Element> {
  const highlights = await Effect.runPromise(
    getHighlights({ imageWidth: 463, imageHeight: 260 })
      .pipe(
        Effect.provide(FetchHttpClient.layer),
      ),
  );
  const categories = await Effect.runPromise(
    getCategories({ imageWidth: 50, imageHeight: 50 })
      .pipe(
        Effect.provide(FetchHttpClient.layer),
      ),
  );

  return (
    <Page>
      {highlights.length > 0 && <section>
        <Highlights title="Highlights" highlights={[...highlights]} />
      </section>}
      {categories.length > 0 && <section>
        <Categories title="Categories" categories={[...categories]} />
      </section>}
    </Page>
  );
}
