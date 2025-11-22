import * as fs from 'fs';
import * as path from 'path';

import {
  Array, Effect, pipe,
} from 'effect';
import { Metadata } from 'next';
import { Banner } from '@/components/Banner/Banner';
import { Content } from '@/components/Content/Content';
import { Page } from '@/components/Page/Page';
import { getCategories, getCategory } from '@/queries';
import { MainLayer } from '@/services/AppRuntime';
import { CacheServiceTag } from '@/services/PersistentCache';

type PageProps = {
  params: {
    category: string,
  },
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => Effect.runPromise(
  pipe(
    Effect.promise(async () => params),
    Effect.flatMap(({ category: id }) => getCategory({ id })),
    Effect.map((cat) => ({
      title: cat.name,
    })),
    Effect.provide(MainLayer),
  ),
);

// Static params required for `output: "export"`. Update this list with real category IDs.
export const dynamicParams = false;

export const generateStaticParams = async (): Promise<Array<{ category: string }>> => {
  console.log('Generating static params for categories...');
  return Effect.runPromise(
    pipe(
      Effect.all([getCategories(), CacheServiceTag]),
      Effect.map(([categories]) => categories),
      Effect.map((categories) => {
        const previousOutDir = path.join(process.cwd(), '.previous-out');
        if (!fs.existsSync(previousOutDir)) {
          return categories;
        }

        return categories.filter((category) => {
          const htmlPath = path.join(previousOutDir, 'categories', category.id, 'index.html');
          const exists = fs.existsSync(htmlPath);
          if (exists) {
            // eslint-disable-next-line no-console
            console.log(`[Incremental Build] Skipping existing page: categories/${category.id}`);
          }
          return !exists;
        });
      }),
      Effect.map(Array.map((category) => ({ category: category.id }))),
    ).pipe(
      Effect.provide(MainLayer),
    ),
  );
};

const CategoryPage = async ({ params }: PageProps): Promise<JSX.Element> => Effect.runPromise(
  pipe(
    Effect.promise(async () => params),
    Effect.tap(({ category }) => Effect.sync(() => console.log(`[Page Generation] Building Category: ${category}`))),
    Effect.flatMap(({ category: id }) => getCategory({ id, imageWidth: 1483, imageHeight: 447 })),
    Effect.map(
      (cat) => (
        <Page>
          <Banner
            image={cat.image}
            title={cat.name}
            description={cat.description} />
          {cat.aimsAndScope && <Content content={cat.aimsAndScope} />}
        </Page>
      ),
    ),
  ).pipe(
    Effect.provide(MainLayer),
  ),
);

export default CategoryPage;
