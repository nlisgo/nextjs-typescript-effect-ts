import {
  Array, Effect, pipe,
} from 'effect';
import { Metadata } from 'next';
import type { JSX } from 'react';
import { continuumCategoryPath } from '@/api-paths';
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
      Effect.flatMap(([categories, cache]) => {
        console.log(`Found ${categories.length} categories`);
        return Effect.forEach(categories, (category) => Effect.map(
          cache.has(continuumCategoryPath(category.id)),
          (exists) => ({
            category: category.id,
            exists,
          }),
        ));
      }),
      Effect.map((items) => {
        const nonCached = items.filter((item) => !item.exists);
        if (nonCached.length === 0 && items.length > 0) {
          console.log('All categories cached. Regenerating the first one to satisfy Next.js build.');
          return [items[0]];
        }
        if (nonCached.length < items.length) {
          console.log(`Skipping ${items.length - nonCached.length} cached categories.`);
        }
        return nonCached;
      }),
      Effect.map(Array.map(({ category }) => ({ category }))),
    ).pipe(
      Effect.provide(MainLayer),
    ),
  );
};

const CategoryPage = async ({ params }: PageProps): Promise<JSX.Element> => Effect.runPromise(
  pipe(
    Effect.promise(async () => params),
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
