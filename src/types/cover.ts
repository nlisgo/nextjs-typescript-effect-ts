import { Schema } from 'effect';
import { coverCodec } from '@/codecs/cover';

export type Cover = Schema.Schema.Type<typeof coverCodec>;
