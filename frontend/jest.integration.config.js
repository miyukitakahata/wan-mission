const nextJest = require('next/jest');

const createJestConfig = nextJest({
  // Next.js アプリケーションのパスを指定
  dir: __dirname,
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  // integration テストだけ対象
  testMatch: ['<rootDir>/src/tests/integration/**/*.(test|spec).(ts|tsx|js)'],
  collectCoverageFrom: [
    'src/tests/integration/**/*',
    '!src/**/*.d.ts',
    '!src/lib/firebase/**/*',
  ],
  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage-integration',

  // モジュールのパス解決を設定
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@stripe/stripe-js$': '<rootDir>/__mocks__/@stripe/stripe-js.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};

module.exports = createJestConfig(customJestConfig);
