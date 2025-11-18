import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Highlights } from '@/components/Highlights/Highlights';
import { dummyImage } from '@/tools';

const meta = {
  title: 'Example/Highlights',
  component: Highlights,
  tags: ['autodocs'],
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
        uri: dummyImage(463, 260, `highlight-${i}`),
        alt: 'Alt text',
        width: 463,
        height: 260,
      },
      description: 'This is the description',
    })),
  },
};
