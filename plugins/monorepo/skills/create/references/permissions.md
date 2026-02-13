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
    "monorepo@skills": true
  },
  "permissions": {
    "allow": [
      "Skill(monorepo:*)",
      "Bash(proto *)",
      "Bash(git *)"
    ]
  }
}
```
