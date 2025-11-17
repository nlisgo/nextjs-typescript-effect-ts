import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Banner } from '@/components/Banner/Banner';
import { dummyImage } from '@/tools/dummy-image';

const meta = {
  title: 'Example/Banner',
  component: Banner,
  tags: ['autodocs'],
} satisfies Meta<typeof Banner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: 'Biochemistry and Chemical Biology',
    image: {
      uri: dummyImage(1114, 336),
      alt: 'Alt text',
      width: 1114,
      height: 336,
      credit: 'Credit',
    },
    description: 'This is the description',
  },
};
