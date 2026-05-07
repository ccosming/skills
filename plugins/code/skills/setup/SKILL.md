---
name: setup
description: Initialize the code plugin for the current project. Reads positional arguments or asks for the interaction and artifact languages, then writes .project/config.yaml. No-op if the project is already configured.
user-invocable: true
disable-model-invocation: true
allowed-tools: AskUserQuestion Read Task
argument-hint: "[interaction:en|es] [artifact:en|es]"
---

# Initialize the code plugin in the current project

Initializes the `code` plugin for the current project by creating `.project/config.yaml`. The plugin owns `.project/`; never write or edit files there directly — always delegate to the `artifact-keeper` subagent, which is the only component that talks to the artifact-writer CLI.

## Arguments

Both positional arguments are optional, but if provided, **both must be present** and each must be `en` or `es`:

- `<interaction>` — interaction language (how the plugin talks to the user in future skills).
- `<artifact>` — artifact language (used when writing config.yaml, spec.yaml, epics, etc.).

Examples:

- `/code:setup` — fully interactive; asks both questions.
- `/code:setup es en` — non-interactive; uses `es` for interaction and `en` for artifacts.

## Workflow

### Step 0: Load interaction style

Read `${CLAUDE_PLUGIN_ROOT}/shared/interaction.md` and apply its rules (tone, format, what-never-to-do). The `Language` section starts to apply only after the user picks `interaction_language` later in this skill.

### Step 1: Detect existing configuration

Check whether `.project/config.yaml` already exists in the current working directory. If it exists, stop immediately and tell the user (in their interaction language) something like: "El proyecto ya está configurado." / "This project is already configured." Do not ask any questions and do not invoke the subagent. Reconfiguring config is intentionally out of scope here — the user can edit `.project/config.yaml` by hand if they need to.

### Step 2: Resolve language selections

If the user passed positional arguments to `/code:setup`:

- The first positional is the interaction language; the second is the artifact language.
- Both must be present and each must be exactly `en` or `es`. If either is missing or invalid, stop and explain the expected form: `/code:setup <interaction> <artifact>` with values from `en|es`.
- When both are valid, use them directly and skip the question step.

If no arguments were passed, use AskUserQuestion to ask both questions in a single call:

1. **Interaction language** — language for interacting with you?
   - Options: `Español (es)`, `English (en)`
2. **Artifact language** — language for artifact contents?
   - Options: `English (en)`, `Español (es)`

Map each answer to its ISO code: `es` or `en`. If the user picks "Other" with a value outside `en` / `es`, stop and explain only those two are supported.

### Step 3: Write the artifact

Invoke the `artifact-keeper` subagent with the prompt below (replace `<i>` and `<a>` with the resolved codes; keep the single quotes around the JSON):

```
write config --payload '{"interaction_language":"<i>","artifact_language":"<a>"}'
```

If the subagent reply starts with `ERROR`, surface its `message:` line verbatim to the user and stop.

### Step 4: Confirm and propose next step

On success, tell the user:

- `.project/config.yaml` was created.
- Suggest the next step: run `/code:spec` to drill into the project's technical specification.

## Rules

- Never write to `.project/` directly. Always go through the `artifact-keeper` subagent.
- Never invoke `bin/artifact-writer.js` from this skill. The subagent is the only caller.
- Never ask for fields beyond `interaction_language` and `artifact_language`.
- Never proceed if either value (from arguments or answers) is outside `en` / `es`.
- If only one positional argument is provided, do not silently fall back to questions — stop and ask the user to either pass both arguments or pass none.
