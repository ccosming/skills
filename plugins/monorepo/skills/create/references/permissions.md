# Permissions

Claude Code settings for the monorepo plugin.

## File: `.claude/settings.local.json`

```json
{
  "extraKnownMarketplaces": {
    "skills": {
      "source": {
        "source": "github",
        "repo": "ccosming/skills"
      }
    }
  },
  "enabledPlugins": {
    "monorepo@ccosming-skills": true
  },
  "permissions": {
    "allow": [
      "Skill(monorepo:add)",
      "Skill(monorepo:create)",
      "Skill(monorepo:tools)",
      "Bash(proto *)",
      "Bash(git *)"
    ]
  }
}
```
