import { config } from '@repo/eslint-config/react-internal';
import { domainServicesBoundaries } from '@repo/eslint-config/architecture-boundaries';
import { defineConfig } from 'eslint/config';
import globals from 'globals';

export default defineConfig([
  ...config,
  ...domainServicesBoundaries('src'),
  {
    ignores: ['node_modules/**', 'dist/**', '.vercel/**', 'coverage/**'],
  },
  {
    files: ['jest.config.cjs', 'jest.rules.config.cjs', 'jest.cssStub.cjs'],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },
  {
    files: [
      '**/*.test.ts',
      '**/*.test.tsx',
      'jest.setup.ts',
      '__mocks__/**/*.ts',
      'src/test-utils.tsx',
    ],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
  },
]);
