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

## Claude Code Permissions

After installing pnpm, update `.claude/settings.local.json` to add permissions:

**Read the existing file first**, then merge this permission into the `"allow"` array:

```json
"Bash(pnpm *)"
```

This covers all pnpm commands including `pnpm dlx` (equivalent to `npx`).

**Important:** Don't replace the entire permissions array - only add this entry if it's not already present.
