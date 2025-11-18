import { FetchHttpClient } from '@effect/platform';
import {
  Array, Effect, pipe,
} from 'effect';
import { Metadata } from 'next';
import React, { type JSX } from 'react';
import { Page } from '@/components/Page/Page';
import { Title } from '@/components/Title/Title';
import { getReviewedPreprint, getReviewedPreprints } from '@/queries';
import { jsxToText } from '@/tools';

type PageProps = {
  params: {
    msid: string,
  },
};

export const generateMetadata = async ({ params }: PageProps): Promise<Metadata> => Effect.runPromise(
  pipe(
    Effect.promise(async () => params),
    Effect.flatMap(({ msid: id }) => getReviewedPreprint({ id })),
    Effect.map((rp) => ({
      title: jsxToText(React.createElement(Title, { content: rp.title })),
    })),
  ).pipe(
    Effect.provide(FetchHttpClient.layer),
  ),
);

// Static params required for `output: "export"`. Update this list with real reviewedPreprint IDs.
export const dynamicParams = false;

export const generateStaticParams = async (): Promise<Array<{ msid: string }>> => Effect.runPromise(
  pipe(
    getReviewedPreprints(),
    Effect.map(Array.map(({ id: msid }) => ({ msid }))),
  ).pipe(
    Effect.provide(FetchHttpClient.layer),
  ),
);

const ReviewedPreprintPage = async ({ params }: PageProps): Promise<JSX.Element> => Effect.runPromise(
  pipe(
    Effect.promise(async () => params),
    Effect.flatMap(({ msid: id }) => getReviewedPreprint({ id })),
    Effect.map(
      (rp) => (
        <Page>
          <h1><Title content={rp.title} /></h1>
        </Page>
      ),
    ),
  ).pipe(
    Effect.provide(FetchHttpClient.layer),
  ),
);

export default ReviewedPreprintPage;
