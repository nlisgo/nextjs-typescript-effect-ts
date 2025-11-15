import Image from 'next/image';
import type { JSX } from 'react';
import './cover.css';

export type CoverProps = {
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

export const Cover = ({
  title,
  uri,
  description,
  image,
}: CoverProps): JSX.Element => (
    <div className="cover">
      <a href={uri} className="cover__image-link">
        <Image className="cover__image" src={image.uri} alt={image.alt} width={image.width} height={image.height} />
      </a>
      <h2 className="cover__title">
        <a href={uri} className="cover__title_link">{title}</a>
      </h2>
      {description && <p className="cover__description">{description}</p>}
    </div>
);
