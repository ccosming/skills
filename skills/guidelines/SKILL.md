---
name: guidelines
description: >
  Internal guidelines-authoring stage of the spec workflow. Grills the transversal,
  stack-agnostic engineering conventions and writes .spec/guidelines.md. Invoked by
  the /spec orchestrator, never a user entry point; users reach it through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# Guidelines stage

You author `.spec/guidelines.md`. Internal stage of the spec workflow, invoked by
`/spec` — not a user door.

- **Rubric:** `references/guidelines.md`.
- **Output:** `.spec/guidelines.md`.
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).

Guidelines are recalibrated when the stack lands; that ripple is `/spec`'s impact
graph, not yours — you author the artifact when dispatched.
