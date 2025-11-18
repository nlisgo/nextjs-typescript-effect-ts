import { Array, Option, pipe } from 'effect';
import Image from 'next/image';
import type { JSX } from 'react';
import './teasers.css';
import { withBaseUrl } from '@/tools';
import { CategoryId } from '@/types';

export type TeaserImageProps = Option.Option<{
  uri: string,
  alt: string,
  width: number,
  height: number,
  credit: Option.Option<string>,
}>;

export type TeaserProps = {
  title: string,
  uri: string,
  published: Option.Option<Date>,
  description: string,
  image: TeaserImageProps,
  categories: Option.Option<ReadonlyArray<CategoryId>>,
};

export type TeasersProps = {
  title: string,
  uri?: Option.Option<string>,
  teasers: ReadonlyArray<TeaserProps>,
};

export const Teasers = ({
  title,
  uri = Option.none(),
  teasers,
}: TeasersProps): JSX.Element => (
  <>
    {teasers.length > 0 && <section className="teasers">
      <h2 className="teasers__title">{Option.isSome(uri) ? <a href={uri.value} className="teasers__title_link">{title}</a> : title}</h2>
      <ul className="teasers__list">
        {teasers.map((teaser, i) => <li key={i} className="teasers__list_item">
          <div className="teaser">
            {Option.isSome(teaser.image) && <a href={teaser.uri} className="teaser__image-link">
              <Image className="teaser__image" src={teaser.image.value.uri} alt={`${teaser.image.value.alt}${Option.isSome(teaser.image.value.credit) && ` - ${teaser.image.value.credit.value}`}`} width={teaser.image.value.width} height={teaser.image.value.height} />
            </a>}
            <div className="teaser__content">
              {Option.isSome(teaser.categories) && teaser.categories.value.length > 0 && <ul className="teaser__categories">
                {
                  pipe(
                    teaser.categories.value,
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
              {Option.isSome(teaser.published)
                && <time className="teaser__published" dateTime={teaser.published.value.toISOString()}>{teaser.published.value.toDateString()}</time>}
            </div>
          </div>
        </li>)}
      </ul>
    </section>}
  </>
);
