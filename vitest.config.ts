import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { playwright } from '@vitest/browser-playwright';
import { defaultExclude, defineConfig } from 'vitest/config';

import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';

const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));
const storybookConfigDir = path.join(dirname, '.storybook');

export default defineConfig({
  plugins: [
    // Generate Vitest tests from Storybook stories so the Storybook test runner has work to do.
    storybookTest({ configDir: storybookConfigDir }),
  ],
  optimizeDeps: {
    include: ['@storybook/nextjs-vite'],
  },
  test: {
    environment: 'jsdom',
    // Drive Storybook component tests with Vitest's browser mode via Playwright.
    browser: {
      enabled: true,
      provider: playwright(),
      instances: [{ browser: 'chromium' }],
      headless: true,
      api: { host: '127.0.0.1' },
    },
    // Skip large build output directories.
    exclude: [...defaultExclude, 'dist/**', 'out/**', '.next/**', 'storybook-static/**'],
    setupFiles: ['.storybook/vitest.setup.ts'],
  },
});
