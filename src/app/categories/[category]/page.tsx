import { FetchHttpClient } from '@effect/platform';
import { Array, Effect, pipe } from 'effect';
import { notFound } from 'next/navigation';
import type { JSX } from 'react';
import { getCategories, getCategory } from '@/queries/categories';

type PageProps = {
  params: Promise<{
    category: string,
  }>,
};

const categoryParams = pipe(
  getCategories(),
  Effect.map(Array.map((category) => ({ category: category.id }))),
);

// Static params required for `output: "export"`. Update this list with real category IDs.
export const dynamicParams = false;

export const generateStaticParams = async (): Promise<Array<{ category: string }>> => Effect.runPromise(
  categoryParams.pipe(
    Effect.provide(FetchHttpClient.layer),
  ),
);

const loadCategory = async (categoryId: string) => Effect.runPromise(
  getCategory({ id: categoryId }).pipe(
    Effect.provide(FetchHttpClient.layer),
    Effect.catchAll(() => Effect.succeed(undefined)),
  ),
);

// Basic dynamic route placeholder: /categories/[category]
export default async function CategoryPage({ params }: PageProps): Promise<JSX.Element> {
  const { category: categoryId } = await params;

  if (!categoryId) {
    notFound();
  }

  const category = await loadCategory(categoryId);

  if (!category) {
    notFound();
  }

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{category.title}</h1>
      {category.description && (
        <p
          className="category__description"
          dangerouslySetInnerHTML={{
            __html: category.description,
          }}
        />
      )}
      <div className="text-sm text-gray-600">
        <p>
          ID: {category.id}
        </p>
        <p>
          Public page: <a className="text-blue-600 underline" href={category.uri}>{category.uri}</a>
        </p>
      </div>
    </main>
  );
}
