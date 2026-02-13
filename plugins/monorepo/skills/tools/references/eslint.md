# ESLint

Linter for JavaScript and TypeScript with support for React 19.

## Goal

Configure ESLint v10+ with flat config format (`eslint.config.ts`) for TypeScript and React projects, with opinionated rules for consistent code quality.

## Post-Install

After eslint is installed, add the required plugins and parsers:

### For TypeScript Projects

```bash
pnpm add -D -w \
  typescript-eslint \
  eslint-plugin-jsdoc \
  eslint-plugin-tsdoc
```

### For React Projects (in addition to TypeScript packages)

```bash
pnpm add -D -w \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y
```

## Files to Create

### eslint.config.ts (TypeScript Vanilla)

For non-React TypeScript projects:

```typescript
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import tsdoc from 'eslint-plugin-tsdoc';

export default tseslint.config(
  // Base TypeScript config
  ...tseslint.configs.recommendedTypeChecked,

  // TypeScript files only
  {
    files: ['**/*.ts'],
    plugins: {
      jsdoc,
      tsdoc,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      'tsdoc/syntax': 'warn',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/',
      'build/',
      'out/',
      '.next/',
      'node_modules/',
      '*.config.{js,mjs,cjs,ts}',
    ],
  }
);
```

### eslint.config.ts (React 19)

For React/Next.js projects:

```typescript
import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
import tsdoc from 'eslint-plugin-tsdoc';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import jsxA11y from 'eslint-plugin-jsx-a11y';

export default tseslint.config(
  // Base TypeScript config
  ...tseslint.configs.recommendedTypeChecked,

  // React config for all JSX files
  {
    files: ['**/*.{jsx,tsx}'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: '19',
      },
    },
  },

  // React Hooks rules
  {
    files: ['**/*.{jsx,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
    },
  },

  // Accessibility rules
  {
    files: ['**/*.{jsx,tsx}'],
    ...jsxA11y.flatConfigs.recommended,
  },

  // TypeScript-only files (jsdoc/tsdoc only for .ts, not .tsx)
  {
    files: ['**/*.ts'],
    plugins: {
      jsdoc,
      tsdoc,
    },
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
      'tsdoc/syntax': 'warn',
    },
  },

  // All TypeScript/JavaScript files
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
    },
  },

  // Ignore patterns
  {
    ignores: [
      'dist/',
      'build/',
      'out/',
      '.next/',
      'node_modules/',
      '*.config.{js,mjs,cjs,ts}',
    ],
  }
);
```

## Integration with Next.js

If using Next.js, it already includes `eslint-config-next`. To integrate:

1. Keep Next.js's built-in ESLint config
2. Extend it with your custom rules in `apps/<name>/eslint.config.ts`
3. Don't duplicate rules Next.js already handles

Example for Next.js app:

```typescript
import tseslint from 'typescript-eslint';

export default tseslint.config(
  // Extend Next.js config (it's already configured)
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-exports': 'error',
    },
  }
);
```

## Moon Tasks

Add to `.moon/tasks/all.yml`:

```yaml
tasks:
  lint:
    command: 'eslint'
    args: ['.']
    options:
      cache: true

  lint-fix:
    command: 'eslint'
    args: ['.', '--fix']
    options:
      cache: false
```

## VS Code

Add to `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint"
  ]
}
```

Add to `.vscode/settings.json`:

```json
{
  "eslint.enable": true,
  "eslint.format.enable": true,
  "eslint.experimental.useFlatConfig": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  }
}
```

## Claude Code Hooks

Optional hooks for `.claude/settings.json`:

```json
{
  "hooks": {
    "PostFileWrite": [{
      "matcher": "*.{js,jsx,ts,tsx}",
      "command": "pnpm exec eslint --fix \"$FILE\" || true"
    }]
  }
}
```

## Notes

- ESLint v10+ uses flat config (`eslint.config.ts`) by default
- `projectService: true` enables type-aware linting without explicit tsconfig path
- jsdoc and tsdoc plugins only apply to `.ts` files (not `.tsx`) for documentation quality
- For React projects, all rules apply but docs plugins are TypeScript-only
- Prettier should handle formatting, not ESLint (disable formatting rules if using both)
