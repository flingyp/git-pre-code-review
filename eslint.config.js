import flypeng from '@flypeng/eslint-config';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...flypeng(),
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-non-null-asserted-optional-chain': 0,
    },
  },
];
