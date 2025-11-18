import { Array, pipe } from 'effect';
import Image from 'next/image';
import type { JSX } from 'react';
import './teasers.css';
import { withBaseUrl } from '@/tools';
import { CategoryId } from '@/types';

export type TeaserImageProps = {
  uri: string,
  alt: string,
  width: number,
  height: number,
  credit?: string,
};

export type TeaserProps = {
  id: string,
  title: string,
  uri: string,
  published?: Date,
  description: string,
  image?: TeaserImageProps,
  categories?: ReadonlyArray<CategoryId>,
};

export type TeasersProps = {
  title: string,
  uri?: string,
  teasers: ReadonlyArray<TeaserProps>,
};

export const Teasers = ({
  title,
  uri,
  teasers,
}: TeasersProps): JSX.Element => (
  <>
    {teasers.length > 0 && <section className="teasers">
      <h2 className="teasers__title">{uri ? <a href={uri} className="teasers__title_link">{title}</a> : title}</h2>
      <ul className="teasers__list">
        {teasers.map((teaser, i) => <li key={i} className="teasers__list_item">
          <div className="teaser">
            {teaser.image && <a href={teaser.uri} className="teaser__image-link">
              <Image className="teaser__image" src={teaser.image.uri} alt={`${teaser.image.alt}${teaser.image.credit && ` - ${teaser.image.credit}`}`} width={teaser.image.width} height={teaser.image.height} />
            </a>}
            <div className="teaser__content">
              {teaser.categories && teaser.categories.length > 0 && <ul className="teaser__categories">
                {
                  pipe(
                    teaser.categories,
                    Array.map((category, j) => <li key={j} className="teaser__categories_item"><a href={withBaseUrl(`/categories/${category.id}`)} className="teaser__categories_item_link">{category.name}</a></li>),
                  )
                }
              </ul>}
              <h2 className="teaser__title">
                <a
                  href={teaser.uri}
                  className="teaser__title_link"
                  dangerouslySetInnerHTML={{
                    __html: teaser.title,
                  }}
                />
              </h2>
              <p
                className="teaser__description"
                dangerouslySetInnerHTML={{
                  __html: teaser.description,
                }}
              />
              {teaser.published
                && <time className="teaser__published" dateTime={teaser.published.toISOString()}>{teaser.published.toDateString()}</time>}
            </div>
          </div>
        </li>)}
      </ul>
    </section>}
  </>
);
