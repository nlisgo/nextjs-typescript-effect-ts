import {
  Array, Effect, pipe,
} from 'effect';
import { Metadata } from 'next';
import type { JSX } from 'react';
import { Banner } from '@/components/Banner/Banner';
import { Content } from '@/components/Content/Content';
import { Page } from '@/components/Page/Page';
import { getCategories, getCategory } from '@/queries';
import { MainLayer } from '@/services/AppRuntime';

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

export const generateStaticParams = async (): Promise<Array<{ category: string }>> => Effect.runPromise(
  pipe(
    getCategories(),
    Effect.map(Array.map(({ id: category }) => ({ category }))),
  ).pipe(
    Effect.provide(MainLayer),
  ),
);

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
