import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Option } from 'effect';
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
  statusDate = Option.none(),
  image = () => Option.none(),
  categories = Option.none(),
}: {
  title?: string,
  statusDate?: Option.Option<Date>,
  description?: string,
  image?: (i: number) => TeaserImageProps,
  categories?: Option.Option<ReadonlyArray<CategoryId>>,
}) => (i: number) => ({
  title: title ?? `Complete Teaser ${i + 1}`,
  uri: '#',
  statusDate,
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
        statusDate: Option.some(new Date()),
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
