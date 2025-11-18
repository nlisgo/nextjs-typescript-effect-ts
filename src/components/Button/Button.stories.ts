import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { Option } from 'effect';
import { fn } from 'storybook/test';
import { Button } from './Button';

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: 'Example/Button',
  component: Button,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: 'centered',
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    backgroundColor: { control: 'color' },
  },
  // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
  args: { onClick: fn() },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Primary: Story = {
  args: {
    primary: Option.some(true),
    label: 'Button',
    backgroundColor: Option.none(),
    size: Option.none(),
  },
};

export const Secondary: Story = {
  args: {
    primary: Option.none(),
    label: 'Button',
    backgroundColor: Option.none(),
    size: Option.none(),
  },
};

export const Large: Story = {
  args: {
    size: Option.some('large'),
    label: 'Button',
    primary: Option.none(),
    backgroundColor: Option.none(),
  },
};

export const Small: Story = {
  args: {
    size: Option.some('small'),
    label: 'Button',
    primary: Option.none(),
    backgroundColor: Option.none(),
  },
};
