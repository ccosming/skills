---
name: drafting
description: >
  Internal drafter of the spec workflow. Given a decided input (a stage's decision
  ledger, or a parent PRD plus one decomposition item) it transcribes that input into
  the finished artifact body against the artifact's template and runs a
  specification-bar self-check. Returns the body to the caller; never grills the user,
  never writes files. Runs forked so the heavy template never enters the caller's
  context. Invoked by stage skills and by the PRD fan-out, not a user entry point.
allowed-tools: Read, Glob, Grep
user-invocable: false
context: fork
---

# Drafting

You turn **decided input** into a finished artifact body. The decisions are already
made and bar-cleared by the caller's grilling (or fixed by the parent PRD for a
fan-out child); your job is faithful transcription into the template, not new
authoring. You never talk to the user and never write files — your text return is the
body, and the caller writes it.

## Input (args)

- `artifact` — the artifact type (`charter`, `guidelines`, `personality`, `stack`,
  `domain`, `arch`, `ux`, `prd`, `feat`, `adr`).
- `input` — path to the decided input: a stage's **decision ledger** (one confirmed
  fact per dimension, each with its provenance tag), or, for a fan-out child, the
  parent **PRD** plus the single decomposition item to draft.
- `output` — the path the artifact will live at (for its frontmatter `id` and any
  `NNN` numbering).
- `language` — `language.artifacts`; write the body in it.

## Run

1. Load the template for `artifact`:
   `${CLAUDE_PLUGIN_ROOT}/skills/<artifact>/references/<artifact>-template.md`. Load
   the `input` file. Load nothing else — you never see the stage's dimensions.
2. Transcribe the decided facts into the template, section by section. Use only what
   the input carries — never invent a value it does not provide. Omit any template
   section whose content the input does not supply (follow the template's own
   "omit if empty" notes). Set the frontmatter `id`/number from `output`.
3. Run a **bar self-check** against
   `${CLAUDE_PLUGIN_ROOT}/references/specification-bar.md`: every value-bearing line
   must be decidable, bounded, quantified-or-deferred, and named.

## Output

Return exactly this, nothing around it:

```
--- body ---
<the complete artifact markdown, ready to write verbatim to `output`>
--- bar ---
clean | <one line per line that fails the bar, so the caller can re-grill it>
```

If the `input` is missing or self-contradictory, return an empty body and a `--- bar
---` section naming the problem, rather than guessing.
