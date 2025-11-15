import { Schema } from 'effect';
import { imageCodec } from '@/codecs/image';

export type Image = Schema.Schema.Type<typeof imageCodec>;
