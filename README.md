# Carlos's claude code skills

A curated collection of plugins for Claude Code that extend its capabilities with specialized workflows, tools, and agents.

## 📦 Available Plugins

| Plugin | Version | Description |
|--------|---------|-------------|
| [**monorepo**](./plugins/monorepo/) | 1.0.0-alpha.1 | Multi language monorepo management with Moon v2 + Proto |

## 🚀 Quick Start

### Installation

1. Clone this repository to your local machine:

   ```bash
   git clone https://github.com/ccosming/skills.git
   ```

1. Configure Claude Code to use these plugins by adding to your `.claude/settings.json`:

   ```json
   {
     "plugins": [
       "/path/to/skills/plugins/monorepo"
     ]
   }
   ```

1. Restart Claude Code or reload plugins

### Usage

Each plugin provides its own skills, commands, and agents. See individual plugin documentation for details.

## 📚 Plugin Documentation

### [Monorepo Plugin](./plugins/monorepo/)

**Purpose:** Opinionated monorepo setup and management with Moon v2 build system and Proto version manager.

**Features:**

- 🏗️ Create monorepos from scratch
- 🔧 Manage development tools (node, pnpm, prettier, eslint)
- ➕ Add scaffolds (Next.js 16, React 19, Tailwind 4)
- 🤖 Intelligent agents for orchestration and validation

**Skills:**

- `/monorepo:create` - Initialize a new monorepo
- `/monorepo:tools` - Install and configure dev tools
- `/monorepo:add` - Add apps, packages, scripts, or modules

**Agents:**

- `manager` - Orchestrates complex operations
- `checker` - Validates monorepo consistency

[→ Full Documentation](./plugins/monorepo/README.md)

## 🤝 Contributing

Contributions are welcome! You can help by:

- **Reporting bugs** - Open an issue with details
- **Fixing bugs** - Submit a PR with the fix
- **Adding features** - Extend existing plugins with new capabilities
- **Improving docs** - Fix typos, clarify instructions, add examples
- **Adding tools** - Contribute new tools to the monorepo plugin
- **Adding scaffolds** - Contribute new scaffolds (Astro, Vite, etc.)

**How to contribute:**

1. Fork this repository
1. Create a feature branch
1. Make your changes
1. Test thoroughly
1. Submit a pull request

## 📖 Resources

- [Claude Code Documentation](https://code.claude.com/docs)
- [Plugin Development Guide](https://code.claude.com/docs/en/plugins)
- [Custom Agents Guide](https://code.claude.com/docs/en/sub-agents)

## 📄 License

This marketplace and all plugins within it are licensed under the MIT License unless otherwise specified in individual plugin directories.

## 👤 Author

- Email: Carlos Cosming <dev@ccosming.com>
- Repository: <https://github.com/ccosming/skills>

---

**Note:** This is a personal collection of Claude Code plugins. Contributions for bug fixes, improvements, and new features are welcome.
