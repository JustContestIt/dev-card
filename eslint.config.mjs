// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettier from 'eslint-config-prettier';

export default tseslint.config(
  { ignores: ['dist/**', 'node_modules/**', 'public/**', 'coverage/**', '*.mjs', 'scripts/**'] },
  eslint.configs.recommended,
  prettier,
  // Backend + tests: strict, type-aware rules
  {
    files: ['src/**/*.ts', 'test/**/*.ts', 'prisma/**/*.ts'],
    extends: [...tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/require-await': 'off',
    },
  },
  // Jest specifics: expect(mock.method) trips unbound-method on purpose
  {
    files: ['src/**/*.spec.ts', 'test/**/*.ts'],
    rules: {
      '@typescript-eslint/unbound-method': 'off',
    },
  },
  // Browser bundle: syntax-level rules only (own tsconfig, DOM libs)
  {
    files: ['web/**/*.ts'],
    extends: [...tseslint.configs.recommended],
    languageOptions: {
      globals: {
        window: 'readonly',
        document: 'readonly',
        fetch: 'readonly',
        localStorage: 'readonly',
        navigator: 'readonly',
        console: 'readonly',
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        requestAnimationFrame: 'readonly',
      },
    },
  },
);
