import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Title } from '@/components/Title/Title';

const meta = {
  title: 'Example/Title',
  component: Title,
  tags: ['autodocs'],
} satisfies Meta<typeof Title>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: 'Basic title',
  },
};

export const Complex: Story = {
  args: {
    content: [
      'This ',
      {
        type: 'Emphasis',
        content: ['is'],
      },
      ' a ',
      {
        type: 'Subscript',
        content: ['more'],
      },
      ' of a complex title',
    ],
  },
};
