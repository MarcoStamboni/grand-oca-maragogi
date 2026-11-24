// @ts-check
import js from '@eslint/js';
import astro from 'eslint-plugin-astro';
import { defineConfig, globalIgnores } from 'eslint/config';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores(['dist/', '.astro/', 'node_modules/', '.cache/', 'reports/', 'publicar/']),
  js.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  astro.configs['flat/recommended'],
  // Regras de acessibilidade (jsx-a11y) aplicadas ao markup dos componentes .astro.
  astro.configs['flat/jsx-a11y-strict'],
  {
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Regiões roláveis (tabelas largas) precisam ser focáveis para quem usa teclado (WCAG 2.1.1).
      'astro/jsx-a11y/no-noninteractive-tabindex': ['error', { roles: ['tabpanel', 'region'] }],
    },
  },
  {
    // Scripts de build (Node) podem registrar progresso no console.
    files: ['scripts/**/*.{js,mjs,ts}'],
    rules: { 'no-console': 'off' },
  },
);
