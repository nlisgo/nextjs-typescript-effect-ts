import { Effect, pipe } from 'effect';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { type JSX } from 'react';
import { Page } from '@/components/Page/Page';
import { Teasers } from '@/components/Teasers/Teasers';
import { MainLayer } from '@/services/AppRuntime';
import { getReviewedPreprints } from '@/top-up/reviewed-preprints';

const ITEMS_PER_PAGE = 20;

type PageProps = {
  params: Promise<{
    path?: Array<string> | string,
  }>,
};

const parsePageNumber = (path?: Array<string> | string): number => {
  if (typeof path === 'string') {
    const pageNumber = Number.parseInt(path, 10);
    return Number.isFinite(pageNumber) ? pageNumber : Number.NaN;
  }

  const [page] = path ?? [];
  const pageNumber = Number.parseInt(page ?? '', 10);
  return Number.isFinite(pageNumber) ? pageNumber : Number.NaN;
};

export const dynamicParams = false;

export const generateStaticParams = async (): Promise<Array<{ path: Array<string> }>> => {
  console.log('Generating static params for reviewed preprint listing pages...');
  return Effect.runPromise(
    pipe(
      getReviewedPreprints(),
      Effect.map((rps) => Math.ceil(rps.length / ITEMS_PER_PAGE)),
      Effect.map((totalPages) => Array.from(
        { length: totalPages },
        (_, index) => ({ path: [`${index + 1}`] }),
      )),
    ).pipe(
      Effect.provide(MainLayer),
    ),
  );
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => {
  const { path } = await params;
  const pageNumber = parsePageNumber(path);
  if (!Number.isFinite(pageNumber)) {
    return { title: 'Reviewed Preprints' };
  }
  return {
    title: pageNumber > 1
      ? `Reviewed Preprints (Page ${pageNumber})`
      : 'Reviewed Preprints',
  };
};

const ReviewedPreprintsPagedPage = async ({ params }: PageProps): Promise<JSX.Element> => {
  const { path } = await params;
  const pageNumber = parsePageNumber(path);

  if (!Number.isInteger(pageNumber) || pageNumber < 1) {
    notFound();
  }

  const teasers = await Effect.runPromise(
    pipe(
      getReviewedPreprints(),
      Effect.map((rps) => {
        const start = (pageNumber - 1) * ITEMS_PER_PAGE;
        return rps.slice(start, start + ITEMS_PER_PAGE);
      }),
    ).pipe(
      Effect.provide(MainLayer),
    ),
  );

  if (teasers.length === 0) {
    notFound();
  }

  return (
    <Page>
      <section key={`reviewed-preprints-page-${pageNumber}`}>
        <Teasers title="Reviewed Preprints" teasers={teasers} />
      </section>
    </Page>
  );
};

export default ReviewedPreprintsPagedPage;
