import { FetchHttpClient } from '@effect/platform';
import {
  Array, Effect, Option, pipe,
} from 'effect';
import { Metadata } from 'next';
import type { JSX } from 'react';
import { Banner } from '@/components/Banner/Banner';
import { Content } from '@/components/Content/Content';
import { Page } from '@/components/Page/Page';
import { getCategories, getCategory } from '@/queries/categories';

type PageProps = {
  params: {
    category: string,
  },
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { category } = await params;
  return Effect.runPromise(
    pipe(
      getCategory({ id: category }),
      Effect.map((cat) => ({
        title: cat.title,
      })),
    ).pipe(
      Effect.provide(FetchHttpClient.layer),
    ),
  );
};

// Static params required for `output: "export"`. Update this list with real category IDs.
export const dynamicParams = false;

export const generateStaticParams = async (): Promise<Array<{ category: string }>> => Effect.runPromise(
  pipe(
    getCategories(),
    Effect.map(Array.map((category) => ({ category: category.id }))),
  ).pipe(
    Effect.provide(FetchHttpClient.layer),
  ),
);

const CategoryPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { category } = await params;
  return (
    <Page>
      {
        Effect.runPromise(
          pipe(
            getCategory({ id: category, imageWidth: 1483, imageHeight: 447 }),
            Effect.map(
              (cat) => (
                <>
                  <Banner
                    image={cat.image}
                    title={cat.title}
                    description={Option.some(cat.description)} />
                  {cat.aimsAndScope && <Content content={cat.aimsAndScope} />}
                </>
              ),
            ),
          ).pipe(
            Effect.provide(FetchHttpClient.layer),
          ),
        )
      }
    </Page>
  );
};

export default CategoryPage;
