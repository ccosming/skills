# pnpm

Fast, disk space efficient package manager.

## Goal

Configure pnpm workspace for the monorepo with hoisting and peer dependency handling.

## Files to Create

### pnpm-workspace.yaml

```yaml
packages:
  - 'apps/*'
  - 'packages/*'
  - 'modules/*'
  - 'scripts/*'
```

### .npmrc

```ini
shamefully-hoist=true
strict-peer-dependencies=false
auto-install-peers=true
```

## Moon Integration

Add to `.moon/toolchains.yml`:

```yaml
javascript:
  packageManager: 'pnpm'

pnpm:
  version: '<from versions.json>'
```
