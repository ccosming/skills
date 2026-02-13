# Next.js App

Next.js 16 application with React 19, Tailwind CSS 4, and App Router.

## Configuration

**Target directory**: `apps/<name>`

**Creation command**:

```bash
pnpm create next-app@latest apps/<name> \
  --yes \
  --ts \
  --tailwind \
  --app \
  --src-dir \
  --eslint \
  --import-alias "@/*" \
  --no-git
```

**Flags explained**:

- `--yes`: Skip all prompts (use defaults)
- `--ts`: TypeScript (default, explicit for clarity)
- `--tailwind`: Tailwind CSS 4 support
- `--app`: App Router (not Pages Router)
- `--src-dir`: All code in `src/` directory
- `--eslint`: ESLint configuration
- `--import-alias "@/*"`: Standard alias for imports
- `--no-git`: Don't initialize git (monorepo already has it)
- Note: NO `--use-pnpm` flag (monorepo root manages pnpm)

## Post-Creation Cleanup

After running `create-next-app`, apply these customizations:

### 1. Remove pnpm files (monorepo manages these)

Remove pnpm files that Next.js creates locally:

```bash
rm -f apps/<name>/pnpm-lock.yaml
rm -f apps/<name>/pnpm-workspace.yaml
```

The monorepo root manages these files, not individual apps.

### 2. Clean public directory

Remove all files in `apps/<name>/public/` except:

- Keep the directory itself
- Remove: `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`
- The app should work without these assets

### 2. Simplify page.tsx

Replace `apps/<name>/src/app/page.tsx` with minimal Hello World:

```tsx
export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <h1 className="text-4xl font-bold">Hello World</h1>
    </div>
  );
}
```

### 3. Simplify globals.css

Replace `apps/<name>/src/app/globals.css` with minimal setup:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

### 4. Remove unnecessary API routes

Check `apps/<name>/src/app/api/` and remove if it exists (create-next-app sometimes adds example routes).

### 5. Clean layout.tsx

Simplify `apps/<name>/src/app/layout.tsx` - remove Geist fonts and unnecessary metadata:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "<name>",
  description: "Next.js application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
```

### 6. Update package.json name

Ensure `apps/<name>/package.json` has correct name:

```json
{
  "name": "@monorepo/<name>",
  ...
}
```

## Monorepo Integration

### ESLint

If the monorepo has a root ESLint config:

1. Check for `eslint.config.mjs` or `.eslintrc.json` in root
2. Modify `apps/<name>/eslint.config.mjs` to extend from root
3. Keep Next.js-specific rules in the app config

### Prettier

If the monorepo has Prettier installed:

1. The app will inherit from root `.prettierrc`
2. No app-specific prettier config needed

### TypeScript

If the monorepo has a root `tsconfig.json`:

1. Check if `apps/<name>/tsconfig.json` should extend from root
2. Keep Next.js-specific compiler options in app config

### Moon Integration (Optional)

If Moon is configured in the monorepo:

1. Create `apps/<name>/moon.yml`:

```yaml
type: application
language: typescript

tasks:
  dev:
    command: pnpm dev
    preset: server
  build:
    command: pnpm build
    inputs:
      - src/**/*
      - public/**/*
    outputs:
      - .next/**/*
  lint:
    command: pnpm lint
  type-check:
    command: pnpm tsc --noEmit
```

## Final Message

After successful creation:

```
🎉 Next.js app created at apps/<name>!

Start developing: cd apps/<name> && pnpm dev
```
