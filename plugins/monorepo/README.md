# Monorepo Plugin

Opinionated monorepo management for Claude Code using Moon v2 and Proto.

## Overview

This plugin provides a complete workflow for creating and managing multilanguage monorepos with:

- **Moon v2** - Fast, scalable build system
- **Proto** - Version manager for tools (node, pnpm, python, etc.)
- **Structured scaffolds** - Pre-configured app templates (Next.js, React 19)
- **Intelligent agents** - Automated orchestration and validation

## Installation

Add to your `.claude/settings.json`:

```json
{
  "plugins": [
    "/path/to/skills/plugins/monorepo"
  ],
  "permissions": {
    "allow": [
      "Skill(monorepo:*)"
    ]
  }
}
```

## Skills

### `/monorepo:create [name]`

Initialize a new monorepo from scratch.

**What it does:**

- Creates `.moon/` configuration
- Sets up `.prototools` for version pinning
- Configures git repository
- Creates `package.json` with workspaces
- Installs Moon via Proto

**Usage:**

```bash
/monorepo:create my-project
```

**Requirements:** Proto must be installed on your system

[→ Skill Documentation](./skills/create/SKILL.md)

---

### `/monorepo:tools <tool> [--check]`

Install and configure development tools with automatic dependency resolution.

**Available tools:**

- `moon` - Moon v2 build system
- `node` - Node.js runtime (LTS)
- `pnpm` - Package manager (latest)
- `python` - Python runtime (LTS)
- `uv` - Python package manager (latest)
- `prettier` - Code formatter (3.5.3)
- `eslint` - Linter for JS/TS (latest)

**Usage:**

```bash
# Install a tool
/monorepo:tools eslint

# Check installation status
/monorepo:tools node --check

# List all available tools
/monorepo:tools
```

**Features:**

- ✅ Automatic dependency resolution
- ✅ Version pinning via Proto or pnpm
- ✅ Post-install configuration
- ✅ Moon integration
- ✅ VS Code recommendations

[→ Skill Documentation](./skills/tools/SKILL.md)

---

### `/monorepo:add <type> <name>`

Add apps, packages, scripts, or modules to the monorepo.

**Available types:**

- `nextjs` - Next.js 16 app with React 19, Tailwind 4, App Router

**Usage:**

```bash
/monorepo:add nextjs web
```

**What it does:**

- Creates scaffold in correct directory (`apps/`, `packages/`, etc.)
- Applies opinionated cleanup (removes boilerplate)
- Integrates with monorepo tools (eslint, prettier)
- Configures Moon tasks (optional)
- Reports next steps

**Opinionated defaults:**

- ✅ TypeScript
- ✅ Tailwind CSS 4
- ✅ App Router (not Pages)
- ✅ `src/` directory
- ✅ Minimal boilerplate (Hello World)
- ✅ ESLint + Prettier pre-configured

[→ Skill Documentation](./skills/add/SKILL.md)

## Agents

### `manager` - Orchestration Agent

**Purpose:** Centralize high-level operations and coordinate skills automatically.

**Example usage:**

```
"Create a monorepo with a Next.js app inside"
```

**What it does:**

1. Spawns `checker` to verify current state
2. Reads dependency metadata from `scaffolds.json` and `versions.json`
3. Resolves tool dependencies recursively
4. Executes skills in correct order:
   - `monorepo:create`
   - `monorepo:tools node`
   - `monorepo:tools pnpm`
   - `monorepo:tools prettier`
   - `monorepo:tools eslint`
   - `monorepo:add nextjs <name>`
5. Spawns `checker` to verify result
6. Reports summary to user

**Model:** Sonnet (complex reasoning)

**Key principle:** Never executes arbitrary commands. Only uses skills to maintain structure.

[→ Agent Documentation](./agents/manager.md)

---

### `checker` - Validation Agent

**Purpose:** Verify monorepo consistency without modifying anything.

**Checks:**

- ✅ Essential files (`.moon/`, `.prototools`, `package.json`)
- ✅ Tool installations and versions
- ✅ Workspace structure and naming
- ✅ Git status
- ✅ Configuration files

**Model:** Haiku (fast, read-only)

**Example output:**

```
Monorepo Health Check
====================
✅ Structure: OK
⚠️  Tools: Issues found
   - pnpm@latest: NOT FOUND ✗
✅ Workspaces: OK
✅ Git: Clean

Recommendation: Install pnpm
```

[→ Agent Documentation](./agents/checker.md)

## Workflow

### Simple Flow (Manual)

Execute skills one by one:
```bash
/monorepo:create my-project
```

**Requirements:** Proto must be installed on your system

[→ Skill Documentation](./skills/create/SKILL.md)

---

### `/monorepo:tools <tool> [--check]`

Install and configure development tools with automatic dependency resolution.

**Available tools:**
- `moon` - Moon v2 build system
- `node` - Node.js runtime (LTS)
- `pnpm` - Package manager (latest)
- `python` - Python runtime (LTS)
- `uv` - Python package manager (latest)
- `prettier` - Code formatter (3.5.3)
- `eslint` - Linter for JS/TS (latest)

**Usage:**
```bash
# Install a tool
/monorepo:tools eslint

# Check installation status
/monorepo:tools node --check

# List all available tools
/monorepo:tools
```

**Features:**
- ✅ Automatic dependency resolution
- ✅ Version pinning via Proto or pnpm
- ✅ Post-install configuration
- ✅ Moon integration
- ✅ VS Code recommendations

[→ Skill Documentation](./skills/tools/SKILL.md)

---

### `/monorepo:add <type> <name>`

Add apps, packages, scripts, or modules to the monorepo.

**Available types:**
- `nextjs` - Next.js 16 app with React 19, Tailwind 4, App Router

**Usage:**
```bash
/monorepo:add nextjs web
```

**What it does:**
- Creates scaffold in correct directory (`apps/`, `packages/`, etc.)
- Applies opinionated cleanup (removes boilerplate)
- Integrates with monorepo tools (eslint, prettier)
- Configures Moon tasks (optional)
- Reports next steps

**Opinionated defaults:**
- ✅ TypeScript
- ✅ Tailwind CSS 4
- ✅ App Router (not Pages)
- ✅ `src/` directory
- ✅ Minimal boilerplate (Hello World)
- ✅ ESLint + Prettier pre-configured

[→ Skill Documentation](./skills/add/SKILL.md)

## Agents

### `manager` - Orchestration Agent

**Purpose:** Centralize high-level operations and coordinate skills automatically.

**Example usage:**
```
"Create a monorepo with a Next.js app inside"
```

**What it does:**
1. Spawns `checker` to verify current state
2. Reads dependency metadata from `scaffolds.json` and `versions.json`
3. Resolves tool dependencies recursively
4. Executes skills in correct order:
   - `monorepo:create`
   - `monorepo:tools node`
   - `monorepo:tools pnpm`
   - `monorepo:tools prettier`
   - `monorepo:tools eslint`
   - `monorepo:add nextjs <name>`
5. Spawns `checker` to verify result
6. Reports summary to user

**Model:** Sonnet (complex reasoning)

**Key principle:** Never executes arbitrary commands. Only uses skills to maintain structure.

[→ Agent Documentation](./agents/manager.md)

---

### `checker` - Validation Agent

**Purpose:** Verify monorepo consistency without modifying anything.

**Checks:**
- ✅ Essential files (`.moon/`, `.prototools`, `package.json`)
- ✅ Tool installations and versions
- ✅ Workspace structure and naming
- ✅ Git status
- ✅ Configuration files

**Model:** Haiku (fast, read-only)

**Example output:**
```
Monorepo Health Check
====================
✅ Structure: OK
⚠️  Tools: Issues found
   - pnpm@latest: NOT FOUND ✗
✅ Workspaces: OK
✅ Git: Clean

Recommendation: Install pnpm
```

[→ Agent Documentation](./agents/checker.md)

## Workflow

### Simple Flow (Manual)

Execute skills one by one:

```bash
/monorepo:create my-project
/monorepo:tools node
/monorepo:tools pnpm
/monorepo:tools eslint
/monorepo:add nextjs web
```

### Orchestrated Flow (Automatic)

Let the manager handle everything:

```
"Create a monorepo called 'my-project' with a Next.js app named 'web'"
```

The manager automatically:
- Creates the monorepo
- Resolves dependencies (node → pnpm → prettier → eslint)
- Installs all tools
- Creates the Next.js app
- Verifies everything worked

## Directory Structure

This plugin creates monorepos with this structure:

```
my-project/
├── .moon/                    # Moon configuration
│   ├── toolchain.yml        # Tool versions
│   └── tasks/               # Shared tasks
├── .prototools              # Proto version pins
├── apps/                    # Applications
│   └── web/                 # Next.js app
├── packages/                # Shared packages
├── scripts/                 # Utility scripts
├── modules/                 # Reusable modules
├── package.json             # Root package.json
├── pnpm-workspace.yaml      # PNPM workspaces
└── eslint.config.ts         # Root ESLint config
```

## Configuration Files

### Scaffolds (`skills/add/scaffolds.json`)

Defines available scaffolds and their dependencies:

```json
{
  "nextjs": {
    "requires": {
      "tools": ["node", "pnpm", "prettier", "eslint"],
      "monorepo": true
    }
  }
}
```

### Tool Versions (`skills/tools/versions.json`)

Defines available tools, versions, and dependencies:

```json
{
  "eslint": {
    "version": "latest",
    "method": "pnpm",
    "requires": ["node", "pnpm"],
    "reference": "eslint.md"
  }
}
```

## Philosophy

This plugin is **opinionated** by design:

1. **Moon + Proto:** One build system, one version manager
2. **Zero prompts:** All commands run non-interactively
3. **Minimal boilerplate:** Clean slate, not tutorial-filled
4. **Monorepo-first:** Everything integrates from day one
5. **Enforced structure:** Agents use skills, skills maintain conventions

## Extending

### Adding a New Tool

1. Update `skills/tools/versions.json`:

```json
{
  "vite": {
    "description": "Vite build tool",
    "version": "latest",
    "method": "pnpm",
    "requires": ["node", "pnpm"],
    "reference": "vite.md"
  }
}
```

2. Create `skills/tools/references/vite.md` with post-install config

3. Done! The skill and manager automatically support it.

### Adding a New Scaffold

1. Create `skills/add/references/astro.md` with configuration

2. Update `skills/add/scaffolds.json`:

```json
{
  "astro": {
    "requires": {
      "tools": ["node", "pnpm"],
      "monorepo": true
    }
  }
}
```

3. Done! The manager resolves dependencies automatically.

## Commands

Internal commands (not user-invocable):

- `install-tool` - Low-level tool installer with dependency resolution

[→ Command Documentation](./commands/install-tool.md)

## Requirements

- **Proto:** Must be installed on your system
  - Install: `curl -fsSL https://moonrepo.dev/install/proto.sh | bash`
- **Git:** For repository management
- **Claude Code:** This plugin requires Claude Code CLI

## Troubleshooting

### "Proto not found"

Install Proto first:

```bash
curl -fsSL https://moonrepo.dev/install/proto.sh | bash
```

### "Tool installation failed"

Check your internet connection and retry. Proto and pnpm require network access.

### "Monorepo structure invalid"

Run the checker agent:

```
"Check monorepo health"
```

It will report specific issues and suggest fixes.

## Roadmap

- [ ] Add more scaffolds (Astro, Vite, Fastify)
- [ ] Python package templates
- [ ] Rust workspace support
- [ ] GitHub Actions integration
- [ ] Deployment presets (Vercel, Netlify, Railway)

## Version History

### 0.0.3 (2026-02-12)
- Added `manager` and `checker` agents
- Added `scaffolds.json` for dependency metadata
- Added ESLint tool with TypeScript + React support
- Improved documentation structure

### 0.0.2
- Added Prettier tool
- Added Next.js scaffold
- Improved Moon integration

### 0.0.1
- Initial release
- Basic monorepo creation
- Tool management (moon, node, pnpm)

## License

MIT

## Author

Carlos Cosming <dev@ccosming.com>

## Resources

- [Moon Documentation](https://moonrepo.dev/docs)
- [Proto Documentation](https://moonrepo.dev/docs/proto)
- [Claude Code Plugins](https://code.claude.com/docs/en/plugins)
