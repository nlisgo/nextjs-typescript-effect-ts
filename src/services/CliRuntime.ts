import { NodeContext, NodeFileSystem } from '@effect/platform-node';
import { Layer } from 'effect';
import { AppMainLayer } from '@/services/AppRuntime';
import { CliConfig } from '@effect/cli';

export const CliMainLayer = Layer.mergeAll(
  AppMainLayer,
  NodeFileSystem.layer,
  NodeContext.layer,
  CliConfig.layer({
    showBuiltIns: false,
  }),
);
