import type { JSX } from 'react';
import './title.css';
import { TitleContent } from '@/types/title';

type TitleProps = {
  content: TitleContent,
};

const prepareContent = (content: TitleContent) => {
  if (typeof content === 'string') {
    return <>{content}</>;
  }

  return content.map((item, i) => {
    if (typeof item === 'string') {
      return <span key={i}>{item}</span>;
    }

    if (item.type === 'Emphasis') {
      return <em key={i}>{item.content.join(' ')}</em>;
    }

    if (item.type === 'Subscript') {
      return <sub key={i}>{item.content.join(' ')}</sub>;
    }

    return <></>;
  });
};

export const Title = ({
  content,
}: TitleProps): JSX.Element => (
  <>
    {prepareContent(content)}
  </>
);
