export default [
  {
    ignores: ['dist/**', 'coverage/**', 'node_modules/**'],
  },
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        afterEach: 'readonly',
        beforeEach: 'readonly',
        describe: 'readonly',
        document: 'readonly',
        expect: 'readonly',
        it: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        Notification: 'readonly',
        process: 'readonly',
        window: 'readonly',
        vi: 'readonly',
      },
    },
    rules: {
      'no-debugger': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^[A-Z]' }],
    },
  },
];
