# Moon v2

Build system and task runner for monorepos.

## Goal

Configure Moon workspace for project discovery, task inheritance, and CI optimization.

## Verification

Check if Moon is properly installed and configured:

```bash
# 1. Check .prototools exists and has moon pinned
test -f .prototools && grep -q 'moon' .prototools || exit 1

# 2. Check moon is accessible via proto
proto status -c local 2>&1 | grep -q 'moon' || exit 1

# 3. Check moon binary works
moon --version >/dev/null 2>&1 || exit 1

# 4. Check .moon/workspace.yml exists
test -f .moon/workspace.yml || exit 1
```

All checks must pass for Moon to be considered installed.

## Installation

Install Moon via proto:

```bash
proto pin moon 2.0.0-rc.2 --resolve && proto use
```

## Configuration

Apply these configurations after installation:

### Files to Create

### .moon/workspace.yml

```yaml
$schema: 'https://moonrepo.dev/schemas/v2/workspace.json'

projects:
  - 'apps/*'
  - 'packages/*'
  - 'modules/*'
  - 'scripts/*'

vcs:
  client: 'git'
  defaultBranch: 'main'

telemetry: false
```

### .moon/toolchains.yml (optional)

```yaml
$schema: 'https://moonrepo.dev/schemas/v2/toolchains.json'

javascript:
  packageManager: 'pnpm'
  inferTasksFromScripts: false
  syncProjectWorkspaceDependencies: true
  dependencyVersionFormat: 'workspace'

node:
  version: '<from versions.json>'

pnpm:
  version: '<from versions.json>'
```

### Project Configuration

Each project needs a `moon.yml`:

```yaml
$schema: 'https://moonrepo.dev/schemas/v2/project.json'

project:
  title: 'Project Name'

layer: 'application'  # or 'library', 'tool', 'automation'
stack: 'frontend'     # or 'backend', 'infrastructure'
tags: ['typescript']

tasks:
  build:
    command: 'tsc --build'
    inputs:
      - 'src/**/*'
    outputs:
      - 'dist'
```

### Inherited Tasks

Create `.moon/tasks/all.yml` for tasks shared by all projects:

```yaml
$schema: 'https://moonrepo.dev/schemas/v2/tasks.json'

fileGroups:
  sources:
    - 'src/**/*'
  tests:
    - 'tests/**/*'

tasks:
  lint:
    command: 'eslint .'
    inputs:
      - '@group(sources)'

  typecheck:
    command: 'tsc --noEmit'
    inputs:
      - '@group(sources)'
```

### VS Code

#### .vscode/settings.json

Create or merge with existing settings:

```json
{
  "yaml.schemas": {
    "https://moonrepo.dev/schemas/v2/project.json": "moon.yml",
    "https://moonrepo.dev/schemas/v2/tasks.json": [".moon/tasks.yml", ".moon/tasks/**/*.yml"],
    "https://moonrepo.dev/schemas/v2/toolchains.json": ".moon/toolchains.yml",
    "https://moonrepo.dev/schemas/v2/workspace.json": ".moon/workspace.yml",
    "https://moonrepo.dev/schemas/v2/template.json": "templates/**/template.yml"
  }
}
```

This enables YAML schema validation and autocomplete for all Moon configuration files.

### .vscode/extensions.json

Create or merge with existing recommendations:

```json
{
  "recommendations": [
    "redhat.vscode-yaml",
    "moonrepo.moon-console"
  ]
}
```

### Claude Code Permissions

After installing Moon, update `.claude/settings.local.json` to add permissions:

**Read the existing file first**, then merge this permission into the `"allow"` array:

```json
"Bash(moon *)"
```

This covers all Moon commands (run, check, query, init, sync, etc.).

**Important:** Don't replace the entire permissions array - only add this entry if it's not already present.

## Commands

```bash
moon run <project>:<task>   # Run task in project
moon run :task              # Run task in all projects
moon check --all            # Run all checks
moon query projects         # List projects
```
