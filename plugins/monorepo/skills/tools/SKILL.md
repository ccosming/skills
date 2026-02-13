---
name: tools
description: "Manage dev tools in a Moon + Proto monorepo. Install, verify, or configure tools."
argument-hint: "<tool> [--check]"
allowed-tools: Read, Glob, Write, Edit, Update, Bash(proto *), Bash(pnpm *), Bash(uv *), Bash(curl *), Bash(test *), Bash(grep *), Bash(moon *), Bash(exit *)
---

# Monorepo Tools

Manage development tools for the monorepo.

## Behavior

**Goal:** Ensure the requested tool is installed and configured, resolving all dependencies automatically.

### When invoked with a tool name:

1. **Read versions.json** to get tool config (`version`, `method`, `requires`, `reference`)
   - If tool not found → respond: `Tool "{name}" is not supported.`

2. **Read reference** `references/{reference}` (if exists)
   - This contains: Verification, Installation, Configuration sections

3. **Resolve dependencies recursively** from `requires` array
   - Build ordered list of all dependencies (depth-first)
   - Process each dependency first, then the tool itself

4. **For each dependency and the tool itself:**

   **A. Verification (check if already installed):**

   a. If reference has "## Verification" section:
      - Extract bash commands from code block
      - Execute sequentially with Bash(test *), Bash(grep *)
      - If all pass (exit 0) → already installed, skip to next tool ✅
      - If any fails (exit 1) → continue to installation

   b. If no Verification section, use generic check:
      - Execute `methods[method].check` from versions.json
      - Example: `pnpm list prettier --depth=0`
      - If passes → already installed, skip ✅
      - If fails → continue to installation

   **B. Installation (if verification failed):**

   a. If reference has "## Installation" section:
      - Extract bash command from code block
      - Execute with appropriate Bash permission
      - Example: `pnpm add -D -w prettier@3.5.3`

   b. If no Installation section, use generic install:
      - Execute `methods[method].install` from versions.json
      - Example: `pnpm add -D -w {tool}@{version}`

   **C. Configuration (after installation):**

   Only if reference exists, process these sections in order:

   a. **"### Post-Install"** (if exists):
      - Execute bash commands
      - Example: `pnpm add -D -w @ianvs/prettier-plugin-sort-imports`

   b. **"### Files to Create"** (if exists):
      - Create each file with Write tool
      - Example: `prettier.config.mjs`, `.prettierignore`

   c. **"### VS Code"** (if exists):
      - Merge `.vscode/settings.json` (Edit/Write)
      - Merge `.vscode/extensions.json` (Edit/Write)

   d. **"### Moon Tasks"** (if exists):
      - Merge `.moon/tasks/all.yml` (Edit/Write)

   e. **"### Claude Code Permissions"** (if exists):
      - Read `.claude/settings.local.json`
      - Merge permissions into `allow` array (no duplicates)
      - Write back with Edit

5. **Report result:**
   - `{tool} is already installed ({version})` ✅
   - `Installed and configured {tool}@{version}` ✅

### When invoked with `--check` flag:

Only verify installation status without making changes. Pass `check-only: true` to `install-tool`.

### When invoked without arguments:

List all available tools from `versions.json` with their status.

## Registry

The `versions.json` file defines:

- `tools`: Available tools with version, method, requires, and reference
- `methods`: How to check/install for each package manager (proto, pnpm, uv)
- `external`: Dependencies not managed by this plugin (e.g., proto itself)
