import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Pagination } from './Pagination';

const meta = {
  title: 'Navigation/Pagination',
  component: Pagination,
  tags: ['experimental'],
  parameters: {
    chromatic: { disableSnapshot: true },
  },
  args: {
    currentPage: 1,
    totalItems: 3964,
    pageSize: 20,
    hrefBuilder: (page: number) => `#page-${page}`,
  },
  argTypes: {
    currentPage: {
      control: { type: 'number', min: 1 },
    },
    totalItems: {
      control: { type: 'number', min: 0 },
    },
    pageSize: {
      control: { type: 'number', min: 1 },
    },
  },
} satisfies Meta<typeof Pagination>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstPage: Story = {
  args: {
    currentPage: 1,
  },
};

export const MiddlePage: Story = {
  args: {
    currentPage: 5,
  },
};

export const LastPage: Story = {
  args: {
    currentPage: 199,
    totalItems: 3980,
  },
};

export const EmptyState: Story = {
  args: {
    currentPage: 1,
    totalItems: 0,
  },
};
