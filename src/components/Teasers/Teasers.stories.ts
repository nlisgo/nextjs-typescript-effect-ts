import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { TeaserImageProps, Teasers } from '@/components/Teasers/Teasers';
import { dummyImage } from '@/tools';
import { CategoryId } from '@/types';

const meta = {
  title: 'Example/Teasers',
  component: Teasers,
  tags: ['autodocs'],
} satisfies Meta<typeof Teasers>;

export default meta;
type Story = StoryObj<typeof meta>;

const exampleTeaserImage =
  (credit: boolean = true) =>
  (i: number): TeaserImageProps => ({
    uri: dummyImage(80, 80, `teaser-${i}`),
    alt: `Placeholder image for teaser ${i}`,
    width: 80,
    height: 80,
    credit: credit ? `Credit ${i}` : undefined,
  });

const exampleTeaser =
  ({
    title,
    description,
    published,
    image = undefined,
    categories,
  }: {
    title?: string;
    published?: Date;
    description?: string;
    image?: (i: number) => TeaserImageProps;
    categories?: ReadonlyArray<CategoryId>;
  }) =>
  (i: number) => ({
    id: `${i}`,
    title: title ?? `Complete Teaser ${i + 1}`,
    uri: '#',
    published,
    description: description ?? 'This is the description',
    image: image ? image(i + 1) : image,
    categories,
  });

export const Default: Story = {
  args: {
    title: 'Teasers',
    uri: '#',
    teasers: [
      exampleTeaser({ title: 'Minimum' }),
      exampleTeaser({
        title: 'Complete',
        image: exampleTeaserImage(),
        published: new Date('2025-01-01'),
        categories: [
          { id: 'category-one', name: 'Category One' },
          { id: 'category-two', name: 'Category Two' },
        ],
      }),
      exampleTeaser({
        title: 'Categories without image',
        image: exampleTeaserImage(),
        categories: [
          { id: 'category-two', name: 'Category Two' },
          { id: 'category-three', name: 'Category Three' },
        ],
      }),
      exampleTeaser({
        title: 'Image without credit',
        image: exampleTeaserImage(false),
      }),
    ].map((teaser, i) => teaser(i + 1)),
  },
};
