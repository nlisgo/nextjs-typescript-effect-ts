import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Content } from '@/components/Content/Content';

const meta = {
  title: 'Example/Content',
  component: Content,
  tags: ['autodocs'],
} satisfies Meta<typeof Content>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    content: [
      {
        type: 'paragraph',
        text: 'Every day, our brains take even the smallest behavioural clues from those around us to build a picture of what they might be thinking or feeling. We generalise this information to help make sense of others and even ourselves, a process called ‘self-other generalisation’.',
      },
      {
        type: 'paragraph',
        text: 'In this interview, Joe Barnby of King’s College London, UK, discusses his recent<a href="https://elifesciences.org/articles/104008"> eLife article</a> on self-other generalisation, describes what happens when the process goes wrong, and explains what modelling experiments can tell us about human relationships more broadly.',
      },
      {
        type: 'paragraph',
        text: '<strong>What was your recent eLife article about?</strong>',
      },
      {
        type: 'paragraph',
        text: 'Self-other generalisation is a process that allows us to build a stable picture of how people behave – and how we should behave – and this helps us to navigate social exchanges with efficiency and adaptability. For some people, however, this process can go awry.',
      },
    ],
  },
};
