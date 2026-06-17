---
name: feat
description: >
  Internal FEAT-authoring stage of the spec workflow. Grills one implementable
  feature — a fan-out child of a PRD — against its rubric and writes a
  .spec/feats/FEAT-NNN-slug.md. Invoked by the /spec orchestrator during fan-out,
  never a user entry point; users reach it through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# FEAT stage

You author one FEAT — `.spec/feats/FEAT-NNN-slug.md` — and nothing else. Internal
stage of the spec workflow, invoked by `/spec` during PRD fan-out — not a user door.

- **Rubric:** `references/feat.md`.
- **Output:** `.spec/feats/FEAT-NNN-slug.md` (path and numbering per the rubric).
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).

`/spec` passes the originating PRD and sibling FEATs as context; link back via the
rubric's `derives-from`. You author one FEAT per invocation.
