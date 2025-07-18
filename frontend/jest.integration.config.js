const nextJest = require('next/jest');
const path = require('path');

const createJestConfig = nextJest({
  // Next.js アプリケーションのパスを指定
  dir: __dirname,
});

const customJestConfig = {
  // rootDir: '.',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  // testEnvironment: 'jest-environment-jsdom',
  // integration テストだけ対象
  testMatch: ['<rootDir>/src/tests/integration/**/*.(test|spec).(ts|tsx|js)'],

  // 実際のアプリケーションコードのカバレッジを計測
  collectCoverageFrom: [
    '<rootDir>/src/app/**/*.{ts,tsx}',
    '<rootDir>/src/components/**/*.{ts,tsx}',
    '<rootDir>/src/hooks/**/*.{ts,tsx}',
    '<rootDir>/src/context/**/*.{ts,tsx}',
    '<rootDir>/src/lib/**/*.{ts,tsx}',
    // 除外するファイル
    '!<rootDir>/src/**/*.d.ts',
    '!<rootDir>/src/**/*.test.{ts,tsx}',
    '!<rootDir>/src/**/*.spec.{ts,tsx}',
    '!<rootDir>/src/tests/**/*',
    '!<rootDir>/src/app/**/layout.tsx',
    '!<rootDir>/src/app/**/loading.tsx',
    '!<rootDir>/src/app/**/error.tsx',
    '!<rootDir>/src/app/**/not-found.tsx',
    '!<rootDir>/src/lib/firebase/**/*',
    '!<rootDir>/src/__mocks__/**/*',
  ],

  coverageReporters: ['text', 'lcov', 'html'],
  coverageDirectory: 'coverage-integration',

  // カバレッジの閾値を設定（80%目標）
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // モジュールのパス解決を設定
  moduleNameMapper: {
    '^@/(.*)$': path.resolve(__dirname, 'src/$1'),
    '^@stripe/stripe-js$': '<rootDir>/__mocks__/@stripe/stripe-js.js',
  },
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
};

// module.exports = createJestConfig(customJestConfig);
module.exports = async () => {
  const config = await createJestConfig(customJestConfig)();
  return {
    ...config,
    testEnvironment: 'jest-environment-jsdom',
  };
};
