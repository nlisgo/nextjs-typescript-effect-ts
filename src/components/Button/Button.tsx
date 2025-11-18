import { Option } from 'effect';
import type { JSX } from 'react';
import './button.css';

export type ButtonProps = {
  /** Is this the principal call to action on the page? */
  primary: Option.Option<true>,
  /** What background color to use */
  backgroundColor: Option.Option<string>,
  /** How large should the button be? */
  size: Option.Option<'small' | 'medium' | 'large'>,
  /** Button contents */
  label: string,
  /** Optional click handler */
  onClick?: () => void,
};

/** Primary UI component for user interaction */
export const Button = ({
  primary = Option.none(),
  size = Option.some('medium'),
  backgroundColor,
  label,
  ...props
}: ButtonProps): JSX.Element => {
  const mode = Option.isSome(primary) ? 'storybook-button--primary' : 'storybook-button--secondary';
  return (
    <button
      type="button"
      className={['storybook-button', ...(Option.isSome(size) ? [`storybook-button--${size.value}`] : []), mode].join(' ')}
      {...(Option.isSome(backgroundColor) ? { style: { backgroundColor: backgroundColor.value } } : {})}
      {...props}
    >
      {label}
    </button>
  );
};
