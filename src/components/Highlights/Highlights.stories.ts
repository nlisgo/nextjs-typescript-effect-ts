import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Highlights } from '@/components/Highlights/Highlights';

const meta = {
  title: 'Example/Highlights',
  component: Highlights,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Highlights>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Highlights',
    highlights: Array<number>(3).fill(1).map((_, i) => i + 1).map((i) => ({
      title: `Highlight ${i}`,
      uri: '#',
      image: {
        uri: `https://picsum.photos/250/150?i=${i}`,
        alt: 'Alt text',
        width: 50,
        height: 50,
      },
      description: 'This is the description',
    })),
    // highlights: [
    //   {
    //     title: 'Highlight 1',
    //     uri: '#',
    //     image: {
    //       uri: 'https://picsum.photos/250/150',
    //       alt: 'Alt text',
    //       width: 250,
    //       height: 150,
    //     },
    //     description: 'This is the description',
    //   },
    //   {
    //     title: 'Highlight 2',
    //     uri: '#',
    //     image: {
    //       uri: 'https://picsum.photos/250/150',
    //       alt: 'Alt text',
    //       width: 250,
    //       height: 150,
    //     },
    //   },
    //   {
    //     title: 'Highlight 3',
    //     uri: '#',
    //     image: {
    //       uri: 'https://picsum.photos/250/150',
    //       alt: 'Alt text',
    //       width: 250,
    //       height: 150,
    //     },
    //     description: 'This is the description',
    //   },
    // ],
  },
};
