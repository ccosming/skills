---
name: personality
description: >
  Internal personality-authoring stage of the spec workflow. Grills the implementer
  persona /code embodies (seniority, decision bias, communication, priorities) and
  writes .spec/personality.md. Invoked by the /spec orchestrator, never a user entry
  point; users reach it through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# Personality stage

You author `.spec/personality.md`. Internal stage of the spec workflow, invoked by
`/spec` — not a user door.

- **Rubric:** `references/personality.md`.
- **Output:** `.spec/personality.md`.
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).
