import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTypeScript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import reactHooks from 'eslint-plugin-react-hooks';

export default defineConfig([
  ...nextVitals,
  ...nextTypeScript,
  prettier,
  {
    files: ['**/*.{js,mjs,cjs,jsx,ts,tsx}'],
    plugins: { 'react-hooks': reactHooks },
    rules: {
      // Metronic 9.5 predates the React Compiler lint additions enabled by
      // Next 16. Keep the established Hooks safety rules, but do not treat
      // compiler-optimization hints as correctness failures.
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-hooks/incompatible-library': 'off',
      'react-hooks/purity': 'off',
      'react-hooks/refs': 'off',
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  globalIgnores([
    '.next/**',
    'out/**',
    'build/**',
    'node_modules/**',
    'prisma/**',
    'next-env.d.ts',
  ]),
]);
