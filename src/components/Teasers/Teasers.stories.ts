import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Option } from 'effect';
import { TeaserImageProps, Teasers } from '@/components/Teasers/Teasers';

const meta = {
  title: 'Example/Teasers',
  component: Teasers,
  tags: ['autodocs'],
} satisfies Meta<typeof Teasers>;

export default meta;
type Story = StoryObj<typeof meta>;

const exampleTeaserImage = (credit: boolean = true) => (i: number): TeaserImageProps => Option.some({
  uri: `https://picsum.photos/seed/teaser-${i}/80/80`,
  alt: `Placeholder image for teaser ${i}`,
  width: 80,
  height: 80,
  credit: credit ? Option.some(`Credit ${i}`) : Option.none(),
});

const exampleTeaser = ({
  title,
  image = () => Option.none(),
}: {
  title?: string,
  image?: (i: number) => TeaserImageProps,
}) => (i: number) => ({
  title: title ?? `Complete Teaser ${i + 1}`,
  uri: '#',
  description: 'This is the description',
  image: image(i + 1),
});

export const Default: Story = {
  args: {
    title: 'Teasers',
    teasers: [
      exampleTeaser({ title: 'Minimum' }),
      exampleTeaser({ title: 'Complete', image: exampleTeaserImage() }),
      exampleTeaser({ title: 'Image without credit', image: exampleTeaserImage(false) }),
    ].map((teaser, i) => teaser(i + 1)),
  },
};
