import type { JSX } from 'react';
import { Button as MantineButton } from '@mantine/core';

export type ButtonProps = {
  /** Is this the principal call to action on the page? */
  primary?: true;
  /** What background color to use */
  color?: string;
  /** How large should the button be? */
  size?: 'small' | 'medium' | 'large';
  /** Button contents */
  label: string;
  /** Optional click handler */
  onClick?: () => void;
};

const setSize = (size: ButtonProps['size']) => {
  switch (size) {
    case 'medium':
      return { size: 'md' };
    case 'large':
      return { size: 'lg' };
  }

  return {};
};

/** Primary UI component for user interaction */
export const Button = ({ primary, size = 'small', color, label, ...props }: ButtonProps): JSX.Element => <MantineButton
  radius="xl"
  {...setSize(size)}
  variant={primary === true ? 'filled' : 'outline'}
  {...(color ? { color } : {})}
  {...props}
>
  {label}
</MantineButton>;
