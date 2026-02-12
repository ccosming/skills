# Prettier

Code formatter for JavaScript, TypeScript, JSON, CSS, and Markdown.

## Goal

Configure Prettier with import sorting for consistent code formatting across the monorepo.

## Post-Install

After prettier is installed, add the import sorting plugin:

```bash
pnpm add -D -w @ianvs/prettier-plugin-sort-imports
```

## Files to Create

### prettier.config.mjs

```javascript
/** @type {import("prettier").Config} */
export default {
  semi: true,
  singleQuote: true,
  tabWidth: 2,
  trailingComma: 'es5',
  printWidth: 100,
  plugins: ['@ianvs/prettier-plugin-sort-imports'],
  importOrder: [
    '<BUILTIN_MODULES>',
    '',
    '<THIRD_PARTY_MODULES>',
    '',
    '^[./]',
  ],
  importOrderParserPlugins: ['typescript', 'jsx', 'decorators-legacy'],
  importOrderTypeScriptVersion: '5.0.0',
};
```

### .prettierignore

```
dist/
.next/
out/
build/
node_modules/
.pnpm-store/
*.min.js
*.min.css
pnpm-lock.yaml
.moon/cache/
```

## Moon Tasks

Add to `.moon/tasks/all.yml`:

```yaml
tasks:
  format:
    command: 'prettier'
    args: ['--write', '.']
    options:
      cache: false

  format-check:
    command: 'prettier'
    args: ['--check', '.']
```

## VS Code

Add to `.vscode/extensions.json`:

```json
{
  "recommendations": ["esbenp.prettier-vscode"]
}
```

Add to `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true
}
```

## Claude Code Hooks

Optional hooks for `.claude/settings.json`:

```json
{
  "hooks": {
    "PostFileWrite": [{
      "matcher": "*.{js,jsx,ts,tsx,mjs,cjs,json,md,css,scss,yaml,yml}",
      "command": "pnpm exec prettier --write \"$FILE\""
    }]
  }
}
```
