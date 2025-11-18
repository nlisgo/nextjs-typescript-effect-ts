import Image from 'next/image';
import type { JSX } from 'react';
import './highlights.css';

export type HighlightProps = {
  title: string,
  uri: string,
  description?: string,
  image: {
    uri: string,
    alt: string,
    width: number,
    height: number,
  },
};

export type HighlightsProps = {
  title: string,
  highlights: Array<HighlightProps>,
};

export const Highlights = ({
  title,
  highlights,
}: HighlightsProps): JSX.Element => (
  <>
    {highlights.length > 0 && <section className="highlights">
      <h2 className="highlights__title">{title}</h2>
      <ul className="highlights__list">
        {highlights.map((highlight, i) => <li key={i} className="highlights__list_item">
          <div className="highlight">
            <a href={highlight.uri} className="highlight__image-link">
              <Image className="highlight__image" src={highlight.image.uri} alt={highlight.image.alt} width={highlight.image.width} height={highlight.image.height} />
            </a>
            <h2 className="highlight__title">
              <a href={highlight.uri} className="highlight__title_link">{highlight.title}</a>
            </h2>
            {highlight.description && (
              <p
                className="highlight__description"
                dangerouslySetInnerHTML={{
                  __html: highlight.description,
                }}
              />
            )}
          </div>
        </li>)}
      </ul>
    </section>}
  </>
);
