import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TeaserImageProps, Teasers } from '@/components/Teasers/Teasers';

const meta = {
  title: 'Example/Teasers',
  component: Teasers,
  tags: ['autodocs'],
} satisfies Meta<typeof Teasers>;

export default meta;
type Story = StoryObj<typeof meta>;

const exampleTeaserImage = (credit: boolean = true) => (i: number): TeaserImageProps => ({
  image: {
    uri: `https://picsum.photos/seed/teaser-${i}/80/80`,
    alt: `Placeholder image for teaser ${i}`,
    width: 80,
    height: 80,
    ...(credit ? { credit: `Credit ${i}` } : {}),
  },
});

const exampleTeaser = (
  title?: string,
  withImage: (i: number) => TeaserImageProps = () => ({}),
) => (i: number) => {
  const image = withImage(i);

  return {
    title: title ?? `Complete Teaser ${i}`,
    uri: '#',
    description: 'This is the description',
    ...image,
  };
};

export const Default: Story = {
  args: {
    title: 'Teasers',
    teasers: [
      exampleTeaser('Minimum')(1),
      exampleTeaser('Complete', exampleTeaserImage())(2),
      exampleTeaser('Image without credit', exampleTeaserImage(false))(3),
    ],
  },
};
