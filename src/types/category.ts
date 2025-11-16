import { Schema } from 'effect';
import { categoryCodec, categorySnippetCodec } from '@/codecs/categories';

export type Category = Schema.Schema.Type<typeof categoryCodec>;
export type CategorySnippet = Schema.Schema.Type<typeof categorySnippetCodec>;
