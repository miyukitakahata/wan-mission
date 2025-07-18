'use client';

import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      lines: 80,
      branches: 80,
      functions: 80,
      statements: 80,
      exclude: [
        'src/tests/e2e/**/*.test.ts', // E2Eテスト除外
        'node_modules/**/*', // ライブラリ除外
        '.next/**/*', // Next.jsビルド成果物除外
        'coverage/**/*', // カバレッジ出力除外
        '**/*.config.{js,ts,mjs}', // 各種設定ファイル除外
        '**/*.d.ts', // 型定義ファイル除外
        '**/.eslintrc.js', // Lint設定除外
        'next.config.js', // Next.js設定除外
        'postcss.config.*',
        'tailwind.config.*',
        'playwright.config.*',
        'vitest.config.*',

        // アプリやUI・副作用系などカバレッジ不要ファイル
        'src/app/**/*.tsx',
        // 'src/app/api/**/*',
        'src/components/ui/**/*',
        'src/components/admin/**/*',
        'src/context/**/*',
        'src/hooks/**/*',
        'src/lib/firebase/**/*',
        'src/tests/__mocks__/**/*',
        'src/lib/utils.ts',
      ],
    },
  },
});
