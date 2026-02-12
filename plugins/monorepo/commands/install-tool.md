---
name: install-tool
description: Verify and install a dev tool with its dependencies
user-invocable: false
allowed-tools: Bash(proto *), Bash(pnpm *), Bash(uv *), Bash(curl *)
---

# Install Tool

Ensures a tool is installed with all its dependencies.

## Parameters

| Parameter | Required | Description |
|-----------|----------|-------------|
| `tool` | Yes | Tool name from versions.json |
| `check-only` | No | If true, only verify installation status |

## Behavior

1. **Read versions.json** to get tool config (`version`, `method`, `requires`, `reference`)

2. **Resolve dependencies** from `requires` array recursively

3. **For each dependency and the tool itself:**
   - Run the `check` command from `methods[method]`
   - If not found and `check-only` is false, run the `install` command
   - If `check-only` is true, report status without installing

4. **Report result:**
   - `{tool} is already installed ({version})`
   - `Installed {tool}@{version}`
   - `Missing: {tool} (run without --check-only to install)`

## External Dependencies

If a `requires` entry is not in `tools` but exists in `external`, use the external check/install commands. Example: `proto` is external (not managed by this plugin).
