import { FetchHttpClient } from '@effect/platform';
import { Effect } from 'effect';
import { JSX } from 'react';
import { Highlights } from '@/components/Highlights/Highlights';
import { Page } from '@/components/Page/Page';
import { getHighlights } from '@/queries/highlights';

export default async function Home(): Promise<JSX.Element> {
  const highlights = await Effect.runPromise(
    getHighlights({ imageWidth: 250, imageHeight: 100 })
      .pipe(
        Effect.provide(FetchHttpClient.layer),
      ),
  );

  return (
    <Page>
      {highlights.length > 0 && <section>
        <Highlights title="Highlights" highlights={[...highlights]} />
      </section>}
    </Page>
  );
}
