import type { JSX } from 'react';
import './highlights.css';
import { Card, CardSection, Flex, Group, Image, Text } from '@mantine/core';

export type HighlightProps = {
  title: string;
  uri: string;
  description?: string;
  image: {
    uri: string;
    alt: string;
    width: number;
    height: number;
  };
};

export type HighlightsProps = {
  title: string;
  highlights: ReadonlyArray<HighlightProps>;
};

export const Highlights = ({ title, highlights }: HighlightsProps): JSX.Element => (
  <>
    {highlights.length > 0 && (
      <section className="highlights">
        <h2 className="highlights__title">{title}</h2>
        <ul className="highlights__list">
          {highlights.map((highlight, i) => (
            <li key={i} className="highlights__list_item">
              <Flex className="highlight">
                <Card shadow="sm" padding="lg" radius="md" withBorder>
                  <CardSection component="a" href={highlight.uri}>
                    <Image
                      src={highlight.image.uri}
                      alt={highlight.image.alt}
                      width={highlight.image.width}
                      height={highlight.image.height}
                    />
                  </CardSection>

                  <Group justify="space-between" mt="md" mb="xs">
                    <Text fw={500} component="a" href={highlight.uri}>{highlight.title}</Text>
                  </Group>

                  {highlight.description && (
                    <Text
                      size="sm"
                      c="dimmed"
                      dangerouslySetInnerHTML={{
                        __html: highlight.description,
                      }}
                    />
                  )}
                </Card>
              </Flex>
            </li>
          ))}
        </ul>
      </section>
    )}
  </>
);
