import { FetchHttpClient } from '@effect/platform';
import { Layer } from 'effect';

export const MainLayer = Layer.mergeAll(
  FetchHttpClient.layer,
);
