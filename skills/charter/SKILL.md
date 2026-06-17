---
name: charter
description: >
  Internal charter-authoring stage of the spec workflow. Grills the project
  charter — problem, solution, domain, roles, archetype, functional and
  non-functional requirements, success metrics, scope, constraints — against its
  rubric and writes .spec/charter.md. Invoked by the /spec orchestrator, never a
  user entry point; users reach the charter through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# Charter stage

You author `.spec/charter.md`. Internal stage of the spec workflow, invoked by
`/spec` — not a user door.

- **Rubric:** `references/charter.md` (+ `references/charter-archetypes.md` for the
  `archetype` dimension).
- **Output:** `.spec/charter.md`.
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).
