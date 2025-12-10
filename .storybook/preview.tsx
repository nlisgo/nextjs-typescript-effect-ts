import type { Decorator, Preview } from '@storybook/nextjs-vite';
import '../src/app/styles/globals.css';
import '@mantine/core/styles.css';
import { ColorSchemeScript, MantineProvider } from '@mantine/core';
import { theme } from '../src/app/theme';

const mantineDecorator: Decorator = (Story, context) => {
  const scheme = (context.globals.theme || 'light') as 'light' | 'dark';

  return (
    <MantineProvider theme={theme} forceColorScheme={scheme}>
      <ColorSchemeScript />
      <Story />
    </MantineProvider>
  );
};

const preview: Preview = {
  parameters: {
    layout: 'fullscreen',
    options: {
      showPanel: false,
      storySort: (a, b) => a.title.localeCompare(b.title, undefined, { numeric: true }),
    },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      name: 'Theme',
      description: 'Mantine color scheme',
      defaultValue: 'light',
      toolbar: {
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark' },
        ],
      },
    },
  },
  decorators: [mantineDecorator],
};

export default preview;
