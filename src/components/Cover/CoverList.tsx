import type { JSX } from 'react';
import './cover-list.css';
import { Cover, CoverProps } from '@/components/Cover/Cover';

export type CoverListProps = {
  title: string,
  covers: Array<CoverProps>,
};

export const CoverList = ({
  title,
  covers,
}: CoverListProps): JSX.Element => (
  <>
    {covers.length > 0 && <section className="cover-list">
      <h2 className="cover-list__title">{title}</h2>
      <ul className="cover-list">
        {covers.map((cover, i) => <li key={i} className="cover-list__item"><Cover {...cover} /></li>)}
      </ul>
    </section>}
  </>
);
