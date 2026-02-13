---
name: tools
description: "Manage dev tools in a Moon + Proto monorepo. Install, verify, or configure tools."
argument-hint: "<tool> [--check]"
allowed-tools: Read, Glob, Write, Edit, Update, Bash(proto *), Bash(pnpm *), Bash(uv *), Bash(curl *)
---

# Monorepo Tools

Manage development tools for the monorepo.

## Behavior

**Goal:** Ensure the requested tool is installed and configured, resolving all dependencies automatically.

### When invoked with a tool name:

1. Read `versions.json` in this skill's directory
2. If tool not found → respond: `Tool "{name}" is not supported.`
3. Invoke `install-tool` command with the tool name
4. If the tool has a `reference`, read it and apply post-install configuration

### When invoked with `--check` flag:

Only verify installation status without making changes. Pass `check-only: true` to `install-tool`.

### When invoked without arguments:

List all available tools from `versions.json` with their status.

## Registry

The `versions.json` file defines:

- `tools`: Available tools with version, method, requires, and reference
- `methods`: How to check/install for each package manager (proto, pnpm, uv)
- `external`: Dependencies not managed by this plugin (e.g., proto itself)
