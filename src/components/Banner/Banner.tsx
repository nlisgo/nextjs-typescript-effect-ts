import Image from 'next/image';
import type { JSX } from 'react';
import './banner.css';
import { BackgroundImage, Box, Center, Text, Title } from '@mantine/core';

export type BannerProps = {
  image: {
    uri: string;
    alt: string;
    width: number;
    height: number;
    credit?: string;
  };
  title: string;
  description?: string;
};

export const Banner = ({ image, title, description }: BannerProps): JSX.Element => (
  <>
    <Box className="banner">
      <BackgroundImage
        className="banner__image"
        src={image.uri}
      >
        <Box className="banner__content">
          <Title order={2}>{title}</Title>
          {description && <Text className="banner__description" c="white" dangerouslySetInnerHTML={{ __html: description }} />}
        </Box>
      </BackgroundImage>
    </Box>
    {image.credit && (
      <Text
        className="banner__credit"
        dangerouslySetInnerHTML={{
          __html: image.credit,
        }}
      />
    )}
  </>
);
