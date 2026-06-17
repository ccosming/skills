---
name: ux
description: >
  Internal UX-authoring stage of the spec workflow. Grills experience qualities,
  surfaces and interactions at the Abstract UI layer and writes .spec/ux.md.
  Invoked by the /spec orchestrator, never a user entry point; users reach it
  through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# UX stage

You author `.spec/ux.md`. Internal stage of the spec workflow, invoked by `/spec` —
not a user door.

- **Rubric:** `references/ux.md` (+ `references/ux-patterns.md` for methodology and
  pattern detail).
- **Output:** `.spec/ux.md`.
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).
