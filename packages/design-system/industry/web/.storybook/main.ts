import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal: (viteConfig) =>
    mergeConfig(viteConfig, {
      build: {
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              return id.includes('/lucide-react/dist/esm/icons/') ? 'icons' : undefined;
            },
          },
        },
      },
    }),
};

export default config;
