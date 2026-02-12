# Monorepo Structure

Files to create for the base monorepo structure.

## Directories

Create via `.gitkeep` files:

- `apps/.gitkeep`
- `packages/.gitkeep`
- `modules/.gitkeep`
- `scripts/.gitkeep`

## File: `.moon/workspace.yml`

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

## File: `.prototools`

```toml
[settings]
auto-install = true
auto-clean = true
```

## File: `.gitignore`

```
# OS
.DS_Store
Thumbs.db

# IDE
.idea/
.vscode/
*.swp

# Environment
.env
.env.local
.env.*.local

# Logs
*.log

# Moon
.moon/cache/

# Proto
.proto/

# Claude Code
.claude/settings.local.json
```

## File: `.vscode/extensions.json`

```json
{
  "recommendations": [
    "redhat.vscode-yaml",
    "moonrepo.moon-console"
  ]
}
```
