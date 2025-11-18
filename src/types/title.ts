import { Schema } from 'effect';
import { titleCodec } from '@/codecs';

export type TitleContent = Schema.Schema.Type<typeof titleCodec>;
