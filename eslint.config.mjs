import nextConfig from 'eslint-config-next/core-web-vitals';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';
import requireExplicitGenerics from 'eslint-plugin-require-explicit-generics';
import { requireTypegraphqlExplicitName } from './eslint-rules/require-typegraphql-explicit-name.mjs';

/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    ignores: [
      'node_modules/**',
      '**/*.d.ts',
      '**/*.test.ts',
      'generated/**',
      '**/*.test.js',
      '**/*.js',
    ],
  },

  // Next.js flat config — registers react, react-hooks, import, @typescript-eslint, etc.
  ...nextConfig,

  // Disable rules that conflict with Prettier
  prettierConfig,

  // Custom rules (all linted files)
  {
    plugins: {
      prettier: prettierPlugin,
      'require-explicit-generics': requireExplicitGenerics,
      local: {
        rules: {
          'require-typegraphql-explicit-name': requireTypegraphqlExplicitName,
        },
      },
    },
    rules: {
      'prettier/prettier': ['warn', { singleQuote: true }],

      // import
      'import/no-unresolved': [1, { ignore: [''] }],
      'import/extensions': [
        'error',
        'ignorePackages',
        { js: 'never', jsx: 'never', ts: 'never', tsx: 'never', '': 'never' },
      ],
      'import/no-extraneous-dependencies': 0,
      'import/no-anonymous-default-export': 'off',

      // react-hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // react
      'react/jsx-filename-extension': [1, { extensions: ['.tsx', '.ts'] }],
      'react/jsx-uses-react': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/function-component-definition': [
        2,
        {
          namedComponents: 'function-declaration',
          unnamedComponents: 'arrow-function',
        },
      ],
      'react/display-name': 'off',
      'react/require-default-props': 'off',

      // general
      'no-shadow': 'off',
      'jsx-quotes': ['error', 'prefer-double'],
      quotes: ['error', 'single', { allowTemplateLiterals: true }],
      'no-case-declarations': 0,
      'no-trailing-spaces': ['error'],
      eqeqeq: ['error'],
      'no-alert': ['error'],
      'no-eq-null': ['error'],
      'object-curly-spacing': ['error', 'always'],
      'space-before-blocks': ['error'],
      'arrow-spacing': ['error'],
      'array-callback-return': 'error',
      'spaced-comment': ['error', 'always'],
      'no-console': 'error',
      'max-len': ['error', { code: 300 }],
      'one-var': ['error', 'never'],
      'no-unreachable': 'error',
      semi: 'error',
      'default-param-last': 'off',
      'no-await-in-loop': 0,
      'no-plusplus': 0,
      'lines-between-class-members': [
        'error',
        'always',
        { exceptAfterSingleLine: true },
      ],
      'no-param-reassign': ['error', { props: false }],
      'local/require-typegraphql-explicit-name': 'error',
    },
  },

  // TypeScript-specific rules (type-aware)
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
      },
    },
    rules: {
      '@typescript-eslint/no-shadow': 'error',
      '@typescript-eslint/explicit-function-return-type': [
        'error',
        { allowExpressions: true, allowTypedFunctionExpressions: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { ignoreRestSiblings: true, argsIgnorePattern: '^_', args: 'all' },
      ],
      '@typescript-eslint/no-explicit-any': ['error', { ignoreRestArgs: true }],
      '@typescript-eslint/no-empty-function': 'error',
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'should', 'has', 'can', 'did', 'will'],
        },
      ],
      'require-explicit-generics/require-explicit-generics': [
        'error',
        ['useState'],
      ],
      'no-undef': 'off',
    },
  },
];
