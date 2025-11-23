import { FetchHttpClient } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import { Layer } from 'effect';
import { USE_PERSISTENT_CACHE } from '@/config/cache-config';
import { PersistentCacheLayer, InMemoryCacheLayer } from './PersistentCache';

export const MainLayer = Layer.mergeAll(
  FetchHttpClient.layer,
  USE_PERSISTENT_CACHE ? PersistentCacheLayer : InMemoryCacheLayer,
  NodeFileSystem.layer,
);
