import { Option } from 'effect';
import Image from 'next/image';
import type { JSX } from 'react';
import './teasers.css';

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
  description: string,
  image: TeaserImageProps,
};

export type TeasersProps = {
  title: string,
  uri?: Option.Option<string>,
  teasers: ReadonlyArray<TeaserProps>,
};

export const Teasers = ({
  title,
  uri = Option.none<string>(),
  teasers,
}: TeasersProps): JSX.Element => (
  <>
    {teasers.length > 0 && <section className="teasers">
      <h2 className="teasers__title">{Option.isSome(uri) ? <a href={uri.value} className="teasers__title_link">title</a> : title}</h2>
      <ul className="teasers__list">
        {teasers.map((teaser, i) => <li key={i} className="teasers__list_item">
          <div className="teaser">
            {Option.isSome(teaser.image) && <a href={teaser.uri} className="teaser__image-link">
              <Image className="teaser__image" src={teaser.image.value.uri} alt={`${teaser.image.value.alt}${Option.isSome(teaser.image.value.credit) && ` - ${teaser.image.value.credit.value}`}`} width={teaser.image.value.width} height={teaser.image.value.height} />
            </a>}
            <div className="teaser__content">
              <h2 className="teaser__title">
                <a href={teaser.uri} className="teaser__title_link">{teaser.title}</a>
              </h2>
              <p
                className="teaser__description"
                dangerouslySetInnerHTML={{
                  __html: teaser.description,
                }}
              />
            </div>
          </div>
        </li>)}
      </ul>
    </section>}
  </>
);
