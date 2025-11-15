import { FetchHttpClient } from '@effect/platform';
import { Effect } from 'effect';
import { JSX } from 'react';
import { CoverList } from '@/components/Cover/CoverList';
import { Page } from '@/components/Page/Page';
import { getCovers } from '@/queries/covers';

export default async function Home(): Promise<JSX.Element> {
  const covers = await Effect.runPromise(
    getCovers({ limit: 3, imageWidth: 250, imageHeight: 100 })
      .pipe(
        Effect.provide(FetchHttpClient.layer),
      ),
  );

  return (
    <Page>
      {covers.length > 0 && <section>
        <CoverList title="Highlights" covers={[...covers]} />
      </section>}
    </Page>
  );
}
