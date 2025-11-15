import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { CoverList } from '@/components/Cover/CoverList';

const meta = {
  title: 'Example/CoverList',
  component: CoverList,
  parameters: {},
  tags: ['autodocs'],
  argTypes: {},
  args: {},
} satisfies Meta<typeof CoverList>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Cover list',
    covers: [
      {
        title: 'Cover title 1',
        uri: '#',
        image: {
          uri: 'https://picsum.photos/250/150',
          alt: 'Alt text',
          width: 250,
          height: 150,
        },
        description: 'This is the description',
      },
      {
        title: 'Cover title 2',
        uri: '#',
        image: {
          uri: 'https://picsum.photos/250/150',
          alt: 'Alt text',
          width: 250,
          height: 150,
        },
        description: 'This is the description',
      },
      {
        title: 'Cover title 3',
        uri: '#',
        image: {
          uri: 'https://picsum.photos/250/150',
          alt: 'Alt text',
          width: 250,
          height: 150,
        },
        description: 'This is the description',
      },
    ],
  },
};
