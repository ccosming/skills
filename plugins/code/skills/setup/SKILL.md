---
name: setup
description: Initialize the code plugin for the current project. Reads positional arguments or asks for the interaction and artifact languages, then writes .project/config.yaml. No-op if the project is already configured.
user-invocable: true
disable-model-invocation: true
allowed-tools: Bash AskUserQuestion Read
argument-hint: "[interaction:en|es] [artifact:en|es]"
---

# Initialize the code plugin in the current project

Initializes the `code` plugin for the current project by writing `.project/config.yaml`. The plugin owns `.project/`; never write or edit files there directly — always go through the artifact-writer CLI.

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

Check whether `.project/config.yaml` already exists in the current working directory.

If it exists, stop immediately and tell the user (in their interaction language) something like: "El proyecto ya está configurado." / "This project is already configured." Do not ask any questions and do not invoke the artifact-writer.

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

Invoke the artifact-writer:

```bash
bun "${CLAUDE_PLUGIN_ROOT}/bin/artifact-writer.js" write config --payload '{"interaction_language":"<i>","artifact_language":"<a>"}'
```

Replace `<i>` and `<a>` with the codes selected. Use single quotes around the JSON. The CLI validates the payload against `plugins/code/schemas/config.schema.json` and writes `.project/config.yaml`.

If the CLI exits non-zero, surface its stderr verbatim to the user and stop.

### Step 4: Confirm and propose next step

On success, tell the user:

- `.project/config.yaml` was created.
- Suggest the next step: run `/code:spec` to drill into the project's technical specification.

## Rules

- Never write to `.project/` directly. Always use the artifact-writer CLI.
- Never ask for fields beyond `interaction_language` and `artifact_language`.
- Never proceed if either value (from arguments or answers) is outside `en` / `es`.
- If only one positional argument is provided, do not silently fall back to questions — stop and ask the user to either pass both arguments or pass none.
