import { CategoryId, TitleContent } from '@/types';

export type ReviewedPreprint = {
  id: string,
  title: TitleContent,
  uri: string,
  published?: Date,
  description: string,
  categories?: ReadonlyArray<CategoryId>,
  evaluationSummary: ReadonlyArray<{ type: 'paragraph', text: string }>,
};
