import { TitleContent } from '@/types/title';

export const titleContentToText = (content: TitleContent): string => {
  if (typeof content === 'string') {
    return content;
  }

  return content
    .map((item) => {
      if (typeof item === 'string') {
        return item;
      }

      return item.content.join(' ');
    })
    .join(' ');
};
