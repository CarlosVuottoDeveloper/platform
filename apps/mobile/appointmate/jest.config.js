const path = require('path');

// Route all react imports to the single React installed in this app's node_modules
// to avoid "invalid hook call" errors from multiple React instances.
const sharedReact = path.resolve(__dirname, 'node_modules/react');

/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['**/*.test.{ts,tsx}'],
  // firestore.rules.test.ts needs the Firestore emulator running (see
  // "test:rules" script) — excluded from the plain `test` run so `yarn test`
  // doesn't fail with ECONNREFUSED when no emulator is up.
  testPathIgnorePatterns: ['/node_modules/', 'firestore\\.rules\\.test'],
  transform: {
    '^.+\\.(js|mjs|ts|tsx)$': [
      'babel-jest',
      {
        configFile: false,
        presets: ['babel-preset-expo'],
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-reanimated|react-native-worklets|react-native-safe-area-context|react-native-screens|react-native-svg|lucide-react-native|@react-navigation|expo|expo-status-bar|@expo|firebase|@react-native-google-signin)/)',
  ],
  moduleNameMapper: {
    '^react$': sharedReact,
    '^react/(.*)$': `${sharedReact}/$1`,
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/async-storage.js',
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.js',
    '^react-native/Libraries/Animated/Animated$': '<rootDir>/__mocks__/react-native-animated.js',
    '^react-native/Libraries/Animated/nodes/AnimatedProps$':
      '<rootDir>/__mocks__/react-native-animated-props.js',
    '^react-native/Libraries/ReactNative/RendererProxy$': '<rootDir>/__mocks__/renderer-proxy.js',
  },
  setupFiles: [
    '<rootDir>/jest.setup.js',
    '<rootDir>/node_modules/@react-native-google-signin/google-signin/jest/build/jest/setup.js',
  ],
};
