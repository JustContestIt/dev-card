/**
 * ts-jest runs in transpile-only mode (fast, no duplicate type-checking):
 * strict type checking is a separate pipeline step — `npm run typecheck`.
 * @type {import('jest').Config}
 */
module.exports = {
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.spec.ts'],
  transform: {
    '^.+\\.ts$': ['ts-jest', { isolatedModules: true }],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/main.ts',
    '!src/**/*.module.ts',
    '!src/**/models/**',
    '!src/content/card-content.ts',
  ],
};
