---
name: setup
description: >
  Writes .spec/config.yaml with the project's chat and artifact languages. The
  first step of project bootstrap; every other skill reads it for localization.
when_to_use: >
  User says "set up the project", "bootstrap", "configure languages", or any
  skill needs config.yaml and it does not exist yet.
allowed-tools: Read, Write, Bash, AskUserQuestion
user-invocable: false
---

# Language setup

Write `.spec/config.yaml` — the languages every skill reads for localization.
This is the only skill that runs before localization can resolve; until config
exists, default to English with neutral register.

## Constitution

Operate under the constitution injected at session start. If it is not in
context, read `../../references/constitution.md` before proceeding.

## Pre-flight

1. Check for config:

   ```bash
   ls .spec/config.yaml 2>/dev/null
   ```

2. If it exists, `AskUserQuestion`: **Keep current** (Recommended) |
   **Regenerate**. On Keep, report the current languages and stop.
3. Create `.spec/` if absent: `mkdir -p .spec`.

## Workflow

### 1. Detect the system language

Run verbatim:

```bash
SYS_LANG=$(defaults read -g AppleLanguages 2>/dev/null | grep -m1 -oE '"[a-z]{2,3}' | tr -d '"'); SYS_LANG=${SYS_LANG:-${LANG%%_*}}; SYS_LANG=${SYS_LANG:-en}; case "$SYS_LANG" in es|en) ;; *) SYS_LANG=en ;; esac; echo "$SYS_LANG"
```

### 2. Ask the user

One `AskUserQuestion` carrying both questions; Recommended = the detected
`SYS_LANG` for both:

- `language.chat`: `en` | `es`
- `language.artifacts`: `en` | `es`

### 3. Write config

```yaml
# Project configuration. Edit directly or re-run /setup to regenerate.
language:
  chat: <en | es>
  artifacts: <en | es>
```

### 4. Hand off

Report the chosen languages and return. `/spec` drives the next stage.

## Invariant rules

- config.yaml is a plain config, not a versioned artifact — no frontmatter, no
  changelog, no `/audit`.
- Only `en` and `es` are supported; anything else falls back to `en`.
- To change languages later, edit config.yaml directly or re-run /setup.
