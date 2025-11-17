import { Option } from 'effect';
import Image from 'next/image';
import type { JSX } from 'react';
import './banner.css';

export type BannerProps = {
  image: {
    uri: string,
    alt: string,
    width: number,
    height: number,
    credit: Option.Option<string>,
  },
  title: string,
  description: Option.Option<string>,
};

export const Banner = ({
  image, title, description,
}: BannerProps): JSX.Element => (
  <>
    <div className="banner">
      <Image className="banner__image" src={image.uri} alt={image.alt} width={image.width} height={image.height} loading="eager" />
      <div className="banner__content">
        <h2>{title}</h2>
        {Option.match(description, {
          onNone: () => null,
          onSome: (desc) => <div
            className="banner__description"
            dangerouslySetInnerHTML={{ __html: desc }}
          />,
        })}
      </div>
    </div>
    {Option.isSome(image.credit) && <div
      className="banner-credit"
      dangerouslySetInnerHTML={{
        __html: image.credit.value,
      }}
    />}
  </>
);
