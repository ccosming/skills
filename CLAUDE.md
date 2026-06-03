# Skills Repository — Maintainer Guide

Personal Claude Code skills and agents by Carlos Cosming. Plugin namespace:
`ccosming` → invoke as `/ccosming:<skill-name>`.

## Repository layout

```text
skills/
├── .claude-plugin/
│   ├── plugin.json          # Plugin metadata (name, description, version)
│   └── marketplace.json     # Marketplace listing
└── skills/
    └── <skill-name>/        # kebab-case folder = command name
        ├── SKILL.md         # Required. Main instructions + YAML frontmatter
        ├── references/      # Optional. Detailed docs loaded on demand
        ├── scripts/         # Optional. Executable helpers (Python, Bash, etc.)
        └── assets/          # Optional. Templates, icons used in output
```

## SKILL.md format

```yaml
---
name: skill-name # Required. kebab-case, matches folder name
description: > # Required. ≤1024 chars. No XML tags (<>).
  [What it does]. [When to use it — trigger phrases]. [Key capabilities].
license: MIT # Optional. MIT or Apache-2.0
allowed-tools: Bash Read Edit # Optional. Pre-approved tools (reduces prompts)
argument-hint: '[arg]' # Optional. Shows in autocomplete
arguments: [arg1, arg2] # Optional. Named vars: $arg1, $arg2 in body
disable-model-invocation: true # Optional. User-only (side-effect workflows)
user-invocable: false # Optional. Claude-only (background knowledge)
---
# Skill Title

Body content here.
```

## Frontmatter fields reference

| Field                      | Required | Notes                                                                                                                |
| -------------------------- | -------- | -------------------------------------------------------------------------------------------------------------------- |
| `name`                     | Yes      | kebab-case only, no spaces or capitals                                                                               |
| `description`              | Yes      | `[What] + [When] + [Key phrases]`. Level 1 (always in context). ≤1024 chars alone; ≤1536 combined with `when_to_use` |
| `license`                  | No       | MIT or Apache-2.0 for open-source skills                                                                             |
| `allowed-tools`            | No       | Space-separated: `Bash Read Edit Grep AskUserQuestion`                                                               |
| `argument-hint`            | No       | Shown during autocomplete, e.g. `[issue-number]`                                                                     |
| `arguments`                | No       | Named positional args. User types `/skill foo bar` → `$0`=foo, `$1`=bar                                              |
| `disable-model-invocation` | No       | `true` prevents auto-invocation. Use for deploys, commits, destructive ops                                           |
| `user-invocable`           | No       | `false` hides from `/` menu. Use for pure knowledge skills                                                           |

## Description field — the most important part

The description is **level 1**: always loaded into Claude's context budget (even
when skill body is not). Claude uses it to decide _whether_ to load the full
skill.

**Formula:** `[What it does] + [When to use it] + [Key capabilities]`

```yaml
# Good — specific, includes trigger phrases
description: >
  Analyzes git diff and drafts a Conventional Commit message in English.
  Use when committing code, staging changes, or asked to "commit", "create a commit",
  or "write a commit message". Runs secrets check before proposing. Requires approval.

# Bad — vague, no triggers
description: Helps with git.

# Bad — technical, no user-facing triggers
description: Implements Conventional Commits v1.0 spec with type/scope/subject parsing.
```

## Three-level progressive disclosure

Skills minimize token cost through three tiers:

1. **YAML frontmatter** — Always in Claude's context. Keep description ≤1024
   chars.
2. **SKILL.md body** — Loaded when Claude decides the skill is relevant. Keep
   under 5,000 words.
3. **`references/` files** — Linked from body. Loaded only when explicitly
   needed.

Move large reference tables, full API docs, and long examples to `references/`
and link them:

```markdown
For complete pattern list, see [references/patterns.md](references/patterns.md).
```

## Body content best practices

Be specific and actionable

```markdown
# Good

Run `git diff --staged --stat` to inspect staged files. If no files are staged,
stop and tell the user.

# Bad

Validate the state before proceeding.
```

**Number sequential steps** — Claude skips unnumbered steps under pressure.

**Include abort conditions** — State explicitly when the skill should stop.

**Add error handling** — Cover the 2-3 most common failure modes with causes and
solutions.

**Use imperative voice** — "Run X", "Ask Y", "Stop if Z". Avoid "should",
"might", "could".

**One rule per concept** — Don't paraphrase the same rule twice (in body and in
a reference file).

## Skill categories

| Category   | Use for                                 | `disable-model-invocation`     |
| ---------- | --------------------------------------- | ------------------------------ |
| Knowledge  | Style guides, patterns, conventions     | No (auto-invoke on match)      |
| Workflow   | Multi-step processes requiring approval | Yes (explicit invocation only) |
| Automation | Side-effect ops (deploy, send, publish) | Yes                            |
| Reference  | Background knowledge Claude should have | `user-invocable: false`        |

## Naming rules

- Folder name: `kebab-case` only — `my-skill` ✓, `MySkill` ✗, `my_skill` ✗
- File name: exactly `SKILL.md` — case-sensitive, no variations
- No `README.md` inside skill folder (documentation goes in `SKILL.md` or
  `references/`)

## Argument patterns

```bash
# User invokes
/ccosming:create-skill auth-helper

# In SKILL.md, access via
$ARGUMENTS          # entire string: "auth-helper"
$0 or $ARGUMENTS[0] # first word
```

Named arguments (declare in frontmatter):

```yaml
arguments: [name, type]
---
Create a $type skill named $name.
```

## Adding a new skill — checklist

- [ ] Folder name is kebab-case and matches `name:` in frontmatter
- [ ] `description` includes what it does + trigger phrases (≤1024 chars)
- [ ] Body under 5,000 words; detailed docs in `references/`
- [ ] Sequential steps are numbered
- [ ] `allowed-tools` pre-approves tools the skill always uses
- [ ] `disable-model-invocation: true` if skill has side effects
- [ ] Tested: triggers on obvious phrases, doesn't trigger on unrelated queries
- [ ] Entry added to plugin.json if needed

## Maintaining existing skills — checklist

Before editing any skill body, ask:

1. Does the description still match what the skill does?
2. Is the same rule stated in more than one place? Remove the duplicate.
3. Is the body still under 5,000 words? If not, move content to `references/`.
4. Does it still trigger correctly after changes? Test 3-5 sample phrases.

## Anti-patterns

- Vague description → skill never auto-invokes
- No trigger phrases in description → Claude doesn't know when to load it
- Paraphrasing the same rule twice → Claude conflict-resolves unpredictably
- Side-effect skill without `disable-model-invocation: true` → unwanted
  auto-runs
- Body over 5,000 words → context bloat, degraded response quality
- README.md inside skill folder → not recognized by the skill system
- Capitals or underscores in folder name → skill won't upload

## Test and Issues

When issues surface during testing of a skill (real user runs, not unit
verification), **always find the root cause and fix structurally**. Patching
the skill to behave well only on the example case is forbidden.

Process:

1. **Reproduce** — verify the issue is real (not user-side, not ESC, not
   environmental). Inspect session JSONL when needed.
2. **Trace to source** — the bug lives in one of: SKILL.md instruction text,
   template placeholder shape, invariant rule absence, or cross-skill
   ambiguity (e.g., shared concept like Localization).
3. **Fix structurally** — change the source. Add the missing invariant, fix
   the placeholder shape, centralize the ambiguous rule. Never add
   example-specific logic.
4. **Verify** — re-run the test from scratch or design a new test that
   proves the structural fix holds.

Anti-patterns:

- Adding a special case for "when X happens, do Y" instead of generalizing.
- Hardcoding values found during one test.
- Patching one skill when the root cause affects N skills (duplication
  trap).
- Treating LLM transcription errors as user error — the skill must be
  robust to the realistic range of LLM behavior.

## Sources

- [The Complete Guide to Building Skills for Claude](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)
  (Anthropic, 2025)
- [Claude Code Skills docs](https://code.claude.com/docs/en/skills)
- [Prompt engineering best practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)
