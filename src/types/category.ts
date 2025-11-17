import { Schema } from 'effect';
import { categoryCodec, categoryIdCodec, categorySnippetCodec } from '@/codecs/categories';

export type CategoryId = Schema.Schema.Type<typeof categoryIdCodec>;
export type Category = Schema.Schema.Type<typeof categoryCodec>;
export type CategorySnippet = Schema.Schema.Type<typeof categorySnippetCodec>;
