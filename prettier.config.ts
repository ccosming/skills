import type { Config } from 'prettier';

interface SortImportsOptions {
  importOrder?: string[];
  importOrderParserPlugins?: string[];
  importOrderTypeScriptVersion?: string;
  importOrderCaseSensitive?: boolean;
}

const config: Config & SortImportsOptions = {
  semi: true,
  singleQuote: true,
  trailingComma: 'all',
  printWidth: 100,
  tabWidth: 2,
  arrowParens: 'always',
  endOfLine: 'lf',
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: ['<BUILTIN_MODULES>', '<THIRD_PARTY_MODULES>', '', '^[./]'],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
  overrides: [
    {
      files: ['*.json', '*.md', '*.yaml', '*.yml'],
      options: { singleQuote: false },
    },
  ],
};

export default config;
