---
name: create-tool
description: "Interactive skill to create a new tool reference for the monorepo-manager plugin. Guides the user through defining prerequisites, installation, configuration presets, Moon integration, and Claude Code hooks."
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(proto list-remote *), Bash(proto plugins list), AskUserQuestion
---

# Create Tool Reference

Create a new tool reference file in `plugins/monorepo-manager/skills/tools/references/` and register it in `versions.json`.

## Workflow

This skill is **interactive**. Gather information from the user before generating any files.

### Step 1 — Gather Tool Information

Ask the user (use `AskUserQuestion`) for:

1. **Tool name**: The canonical name (e.g., `eslint`, `ruff`, `lefthook`).
2. **Description**: One-line description of what the tool does.
3. **Version**: The target version to pin. Offer to look up the latest via `proto list-remote <tool>` if it's a Proto-managed tool.
4. **Installation method**: One of:
   - `proto` — Proto-managed toolchain (runtimes, system tools)
   - `pnpm` — Node.js package installed via `pnpm add -Dw`
   - `uv` — Python tool installed via `uv tool install`
   - `manual` — Custom installation steps

### Step 2 — Gather Configuration Details

Ask the user:

5. **Prerequisites**: Other tools that must be installed first (e.g., `node` for eslint, `python` for ruff). Check `versions.json` to confirm they are already registered.
6. **Config files**: What configuration files does this tool use? For each one:
   - File path relative to project root (e.g., `eslint.config.js`, `ruff.toml`)
   - Whether to include a default preset in the reference
7. **Moon tasks**: Should this tool be integrated as Moon tasks? If yes:
   - Task name(s) (e.g., `lint`, `format`, `typecheck`)
   - Whether they go in global tasks (`.moon/tasks/`) or per-project (`moon.yml`)
   - The command, inputs, and any relevant task options

### Step 3 — Gather Upgrade & Hooks Information

Ask the user:

8. **Upgrade method**: How is this tool upgraded? (e.g., `proto install <tool> --pin`, `pnpm update`, `uv tool upgrade`)
9. **Breaking change notes**: Any known migration steps between major versions.
10. **Claude Code hooks**: Define hooks that should fire for this tool. Common patterns:
    - **PostToolInstall**: Run after the tool is installed (e.g., generate initial config)
    - **PreCommit**: Run before commits (e.g., lint/format checks)
    - **PostDependencyUpdate**: Run when dependencies change (e.g., re-sync configs)

For each hook, capture:
- Hook event/trigger
- Shell command(s) to execute
- Matchers (file patterns that trigger the hook, if applicable)

### Step 4 — Generate Files

Once all information is gathered, generate these files:

#### 4a. Tool Reference File

Create `plugins/monorepo-manager/skills/tools/references/<tool-name>.md` following this template:

```markdown
# <Tool Name> — Installation & Configuration Reference

Reference for installing and configuring <tool-name> in a Proto-managed monorepo.

> **Version target**: <version>

---

## Prerequisites

<List required tools with links to their references if they exist>

## Installation

### Via <method>

<Step-by-step installation commands>

### Verify

<Verification command>

### Upgrade

<Upgrade commands>

---

## Configuration

### Default Config

File: `<config-file-path>`

<Code block with the preset configuration content>

<Repeat for each config file>

---

## Moon Integration

### Tasks

<Task definitions in YAML format, matching the moon.yml or .moon/tasks/ structure>

---

## Upgrade & Maintenance

### Upgrade Steps

<How to upgrade the tool>

### Breaking Changes

<Known migration notes between major versions, or "None documented" if N/A>

---

## Claude Code Hooks

<For each hook, document:>

### <Hook Name>

- **Event**: <trigger event>
- **Matcher**: `<file glob pattern>`
- **Command**: `<shell command>`
- **Purpose**: <why this hook exists>
```

#### 4b. Update versions.json

Read `plugins/monorepo-manager/skills/tools/versions.json` and add the new tool entry:

```json
"<tool-name>": {
  "version": "<version>",
  "method": "<proto|pnpm|uv|manual>",
  "reference": "<tool-name>.md",
  "description": "<one-line description>"
}
```

#### 4c. Update SKILL.md

Add a bullet to the "Tool References" list in `plugins/monorepo-manager/skills/tools/SKILL.md`:

```markdown
- [references/<tool-name>.md](references/<tool-name>.md) — <description>
```

#### 4d. Create Hook Configurations (if any)

If the user defined Claude Code hooks, document them in the reference file. The user is responsible for adding them to their `.claude/hooks/` configuration, but the reference should include the exact hook definitions ready to copy.

### Step 5 — Summary

After generating all files, report:

- Files created/modified
- The tool entry added to `versions.json`
- Any hooks that need to be manually added to `.claude/hooks/`
- Suggested next steps (e.g., "Run `proto use` to install" or "Run `pnpm install`")
