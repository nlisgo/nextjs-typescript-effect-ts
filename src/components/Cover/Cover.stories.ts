import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Cover } from '@/components/Cover/Cover';

const meta = {
  title: 'Example/Cover',
  component: Cover,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof Cover>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Cover title',
    uri: '#',
    image: {
      uri: 'https://picsum.photos/250/150',
      alt: 'Alt text',
      width: 250,
      height: 150,
    },
    description: 'This is the description',
  },
};
