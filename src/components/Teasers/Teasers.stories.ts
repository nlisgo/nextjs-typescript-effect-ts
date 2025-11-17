import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Option } from 'effect';
import { TeaserImageProps, Teasers } from '@/components/Teasers/Teasers';
import { dummyImage } from '@/tools/dummy-image';
import { CategoryId } from '@/types/category';

const meta = {
  title: 'Example/Teasers',
  component: Teasers,
  tags: ['autodocs'],
} satisfies Meta<typeof Teasers>;

export default meta;
type Story = StoryObj<typeof meta>;

const exampleTeaserImage = (credit: boolean = true) => (i: number): TeaserImageProps => Option.some({
  uri: dummyImage(80, 80, `teaser-${i}`),
  alt: `Placeholder image for teaser ${i}`,
  width: 80,
  height: 80,
  credit: credit ? Option.some(`Credit ${i}`) : Option.none(),
});

const exampleTeaser = ({
  title,
  description,
  image = () => Option.none(),
  categories = Option.none(),
}: {
  title?: string,
  description?: string,
  image?: (i: number) => TeaserImageProps,
  categories?: Option.Option<ReadonlyArray<CategoryId>>,
}) => (i: number) => ({
  title: title ?? `Complete Teaser ${i + 1}`,
  uri: '#',
  description: description ?? 'This is the description',
  image: image(i + 1),
  categories,
});

export const Default: Story = {
  args: {
    title: 'Teasers',
    uri: Option.some('#'),
    teasers: [
      exampleTeaser({ title: 'Minimum' }),
      exampleTeaser({
        title: 'Complete',
        image: exampleTeaserImage(),
        categories: Option.some([
          { id: 'category-one', name: 'Category One' },
          { id: 'category-two', name: 'Category Two' },
        ]),
      }),
      exampleTeaser({
        title: 'Categories without image',
        image: exampleTeaserImage(),
        categories: Option.some([
          { id: 'category-two', name: 'Category Two' },
          { id: 'category-three', name: 'Category Three' },
        ]),
      }),
      exampleTeaser({ title: 'Image without credit', image: exampleTeaserImage(false) }),
    ].map((teaser, i) => teaser(i + 1)),
  },
};
