import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Categories } from '@/components/Categories/Categories';

const meta = {
  title: 'Example/Categories',
  component: Categories,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Categories>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Categories',
    categories: Array<number>(18).fill(1).map((_, i) => i + 1).map((i) => ({
      id: `category-${i}`,
      title: `Category ${i}`,
      uri: '#',
      image: {
        uri: `https://picsum.photos/250/150?i=${i}`,
        alt: 'Alt text',
        width: 50,
        height: 50,
      },
      description: 'This is the description',
    })),
  },
};
