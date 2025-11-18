import Image from 'next/image';
import type { JSX } from 'react';
import './banner.css';

export type BannerProps = {
  image: {
    uri: string,
    alt: string,
    width: number,
    height: number,
    credit?: string,
  },
  title: string,
  description?: string,
};

export const Banner = ({
  image, title, description,
}: BannerProps): JSX.Element => (
  <>
    <div className="banner">
      <Image className="banner__image" src={image.uri} alt={image.alt} width={image.width} height={image.height} loading="eager" />
      <div className="banner__content">
        <h2>{title}</h2>
        {description && <div
          className="banner__description"
          dangerouslySetInnerHTML={{ __html: description }}
        />}
      </div>
    </div>
    {image.credit && <div
      className="banner-credit"
      dangerouslySetInnerHTML={{
        __html: image.credit,
      }}
    />}
  </>
);
