module.exports = {
  extends: ['next/core-web-vitals', 'airbnb', 'airbnb-typescript', 'prettier'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    cmaVersion: 'latest',
    sourceType: 'module',
  },
  rules: {
    'react/react-in-jsx-scope': 'off',
    'import/extensions': [
      'error',
      'ignorePackages',
      {
        js: 'never',
        jsx: 'never',
        ts: 'never',
        tsx: 'never',
      },
    ],
    '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    'no-console': 'off',

    // deployment での問題を避けるための設定
    // 現代 React/TypeScript 開発に適さない規則を無効化
    'react/jsx-props-no-spreading': 'off', // prop spreading を許可（UI ライブラリで必要）
    'react/require-default-props': 'off', // TypeScript のデフォルト引数で十分
    'import/prefer-default-export': 'off', // Next.js API routes で問題になる
    'react/function-component-definition': 'off', // 関数コンポーネントの定義方法を自由に
    'jsx-a11y/no-static-element-interactions': 'off', // UI ライブラリで必要な場合がある
    'jsx-a11y/click-events-have-key-events': 'off', // UI ライブラリで必要な場合がある
    'jsx-a11y/no-noninteractive-element-interactions': 'off', // UI ライブラリで必要な場合がある

    // TypeScript で型チェックされるため不要
    'react/prop-types': 'off',
    'react/jsx-no-undef': 'off',

    // 一時的に無効化（必要に応じて個別に対処）
    '@typescript-eslint/no-explicit-any': 'warn', // error から warn に変更
    'no-param-reassign': 'off', // 状態管理で必要な場合がある

    // UI ライブラリで一般的な問題を解決
    'react/no-array-index-key': 'warn', // 場合によっては必要
    'no-nested-ternary': 'off', // 条件付きレンダリングで必要
    'jsx-a11y/heading-has-content': 'off', // 動的コンテンツの場合
    'jsx-a11y/anchor-has-content': 'off', // アイコンのみのリンクの場合
    'react/no-unknown-property': 'off', // カスタムプロパティを許可
    'react/jsx-no-constructed-context-values': 'warn', // パフォーマンスの警告のみ
    '@typescript-eslint/no-use-before-define': 'off', // 関数の順序を柔軟に
    '@typescript-eslint/no-shadow': 'warn', // 変数の影響を警告のみ
    'consistent-return': 'off', // TypeScript で型チェックされる
    'default-case': 'off', // exhaustive switch で不要な場合がある
    'react/button-has-type': 'off', // デフォルトで十分な場合
    'react/no-danger': 'warn', // 危険だが場合によっては必要
    'no-alert': 'warn', // デバッグ用として警告のみ
    '@typescript-eslint/naming-convention': 'off', // 命名規則を柔軟に
    '@typescript-eslint/no-redeclare': 'warn', // 警告のみ
    'react-hooks/rules-of-hooks': 'error', // これは重要なので維持
  },
  settings: {
    'import/resolver': {
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      },
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
  ignorePatterns: [
    'next.config.js',
    'tailwind.config.js',
    '.next/',
    'node_modules/',
    'dist/',
    'build/',
  ],
};
