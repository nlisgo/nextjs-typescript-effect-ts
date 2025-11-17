import type { JSX } from 'react';
import './content.css';

type Paragraph = {
  type: 'paragraph',
  text: string,
};

type ContentProps = {
  content: Array<Paragraph>,
};

export const Content = ({
  content,
}: ContentProps): JSX.Element => (
  <>
    {content.map((item, i) => <p
      key={i}
      className="category__description"
      dangerouslySetInnerHTML={{
        __html: item.text,
      }}
    />)}
  </>
);
