import { Schema } from 'effect';
import { highlightCodec } from '@/codecs/highlights';

export type Highlight = Schema.Schema.Type<typeof highlightCodec>;
