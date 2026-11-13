/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/firestore.rules.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      { tsconfig: { module: 'commonjs', moduleResolution: 'node', esModuleInterop: true } },
    ],
  },
};
