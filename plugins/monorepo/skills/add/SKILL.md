---
name: add
description: Add apps, packages, or modules to the monorepo
argument-hint: "<type> <name>"
allowed-tools: Bash(pnpm *), Bash(test *), Bash(rm *), Bash(rm -rf *), Read, Write, Edit, Glob, Grep, Skill
---

# Add to Monorepo

Add new applications, packages, or modules to the monorepo with opinionated defaults.

## Goal

Create production-ready apps/packages with minimal boilerplate, pre-configured with monorepo tools and best practices.

## Usage

```bash
/monorepo:add <type> <name>
```

**Types:**

- `nextjs` - Next.js 16 app with React 19, Tailwind 4, App Router

## Behavior

### When invoked with a type and name:

1. Read `scaffolds.json` to check if type is supported and get dependencies
2. If not supported → respond: `Type "{type}" is not supported. Available types: {list keys from scaffolds.json}`
3. For each tool in `requires.tools`, ensure it's installed: `Skill: monorepo:tools <tool>`
   - The tools skill will check internally and only install if missing
   - Dependencies are resolved and installed automatically (e.g., node requires proto)
4. If monorepo required, verify all paths in `requires.structure` exist using `test -e <path>`
5. Read `references/<type>.md` for detailed configuration
6. Execute the creation command with all necessary flags (non-interactive)
7. Apply post-creation customizations defined in the reference file
8. Integrate with monorepo tools (if applicable)
9. Report completion with next steps

**Important:** This skill assumes dependencies are already satisfied. If you're orchestrating from another agent (like `manager`), ensure all required tools are installed first.

### When invoked without arguments:

List all available types from the `references/` directory.

## Principles

- **Zero prompts**: All commands run with pre-configured flags
- **Minimal boilerplate**: Remove unnecessary example code and files
- **Monorepo-first**: Integrate with existing tools (eslint, prettier, moon)
- **Opinionated**: Follow best practices, not every possible option
- **Clean slate**: Apps should be production-ready, not tutorial-filled

## Directory Structure

New apps/packages are created in the workspace root following this convention:

- `apps/<name>` - Applications (nextjs, etc.)
- `packages/<name>` - Shared packages/libraries
- `scripts/<name>` - Utility scripts and tools
- `modules/<name>` - Reusable modules and components
