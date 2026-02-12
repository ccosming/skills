# Moon v2

Build system and task runner for monorepos.

## Goal

Configure Moon workspace for project discovery, task inheritance, and CI optimization.

## Files to Create

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

## Project Configuration

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

## Inherited Tasks

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

## Commands

```bash
moon run <project>:<task>   # Run task in project
moon run :task              # Run task in all projects
moon check --all            # Run all checks
moon query projects         # List projects
```
