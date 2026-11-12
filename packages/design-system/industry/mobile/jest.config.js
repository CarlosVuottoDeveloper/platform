const path = require('path');

const sharedReact = path.resolve(__dirname, '../../../../node_modules/react');
const sharedSvg = path.resolve(__dirname, 'node_modules/react-native-svg');

/** @type {import('jest').Config} */
module.exports = {
  preset: '@react-native/jest-preset',
  testMatch: ['**/*.test.{ts,tsx}'],
  transform: {
    '^.+\\.(js|mjs|ts|tsx)$': [
      'babel-jest',
      { configFile: false, presets: ['@react-native/babel-preset'] },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|react-native-safe-area-context|lucide-react-native)/)',
  ],
  moduleNameMapper: {
    '^react$': sharedReact,
    '^react/(.*)$': `${sharedReact}/$1`,
    '^react-native-svg$': sharedSvg,
    '^react-native-svg/(.*)$': `${sharedSvg}/$1`,
    '^react-native-safe-area-context$': '<rootDir>/__mocks__/react-native-safe-area-context.js',
    '^react-native/Libraries/Animated/Animated$': '<rootDir>/__mocks__/react-native-animated.js',
    '^react-native/Libraries/Animated/nodes/AnimatedProps$':
      '<rootDir>/__mocks__/react-native-animated-props.js',
    '^react-native/Libraries/ReactNative/RendererProxy$': '<rootDir>/__mocks__/renderer-proxy.js',
  },
  setupFiles: ['<rootDir>/jest.setup.js'],
};
