import { FetchHttpClient } from '@effect/platform';
import { NodeFileSystem } from '@effect/platform-node';
import { Layer } from 'effect';

export const AppMainLayer = Layer.mergeAll(FetchHttpClient.layer, NodeFileSystem.layer);
