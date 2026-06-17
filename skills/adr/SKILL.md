---
name: adr
description: >
  Internal ADR-authoring stage of the spec workflow. Grills one architecture
  decision record — a fan-out child, immutable once written — against its rubric
  and writes a .spec/adrs/ADR-NNN-slug.md. Invoked by the /spec orchestrator,
  never a user entry point; users reach it through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# ADR stage

You author one ADR — `.spec/adrs/ADR-NNN-slug.md` — and nothing else. Internal stage
of the spec workflow, invoked by `/spec` for a decision with a genuine alternative —
not a user door.

- **Rubric:** `references/adr.md`.
- **Output:** `.spec/adrs/ADR-NNN-slug.md` (path and numbering per the rubric).
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).

A record is immutable: never edit a `done` ADR — a superseding decision is a new
ADR. A decision with no genuine alternative gets a changelog row, not an ADR, so
`/spec` does not dispatch you for it.
