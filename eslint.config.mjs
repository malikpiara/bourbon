// ESLint flat config for Next.js 16.
// eslint-config-next@16 exports native flat config arrays — no FlatCompat needed.
import nextConfig from 'eslint-config-next';
import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettierConfig from 'eslint-config-prettier/flat';

const eslintConfig = [
  ...nextConfig,
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettierConfig,
  {
    rules: {
      'no-console': 'warn',
      'prefer-const': 'warn',
    },
  },
];

export default eslintConfig;
