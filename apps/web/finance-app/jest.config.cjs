/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: {
          jsx: 'react-jsx',
          module: 'commonjs',
          moduleResolution: 'node',
          esModuleInterop: true,
        },
      },
    ],
    '^.+\\.(js|mjs)$': ['babel-jest', { presets: ['@babel/preset-env'] }],
  },
  transformIgnorePatterns: ['node_modules/(?!(lucide-react)/)'],
  setupFilesAfterEnv: ['@testing-library/jest-dom', '<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', 'firestore\\.rules\\.test'],
  // lucide-react (via @industry/web) ships its own nested react copy. Without this mapping
  // its icons render against a second React instance with a null hook dispatcher.
  moduleNameMapper: {
    // The real Firebase SDK needs fetch and firebaseConfig.ts reads import.meta.env; neither
    // loads under Jest. Automocked services still import them, so they resolve to stubs here.
    '^firebase/(.*)$': '<rootDir>/test-stubs/firebase/$1.ts',
    '/firebaseConfig$': '<rootDir>/test-stubs/firebaseConfig.ts',
    '^react$': require.resolve('react'),
    '^react-dom$': require.resolve('react-dom'),
    '\\.css$': '<rootDir>/jest.cssStub.cjs',
  },
};
