import type { Preview, Decorator } from '@storybook/react';
import '@industry/tokens/styles.css';
import { industryTheme } from './theme';

const WithBackground: Decorator = (Story) => (
  <div
    style={{
      background: 'var(--color-bg)',
      color: 'var(--color-text)',
      minHeight: '100vh',
      padding: 24,
    }}
  >
    <Story />
  </div>
);

const preview: Preview = {
  decorators: [WithBackground],
  parameters: {
    backgrounds: {
      default: 'industry',
      values: [{ name: 'industry', value: 'var(--color-bg)' }],
    },
    docs: { theme: industryTheme },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
