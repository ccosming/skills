---
name: arch
description: >
  Internal architecture-authoring stage of the spec workflow. Grills components,
  boundaries, data flow and cross-cutting strategy (authn/authz, observability,
  error handling, config/secrets) and writes .spec/arch.md. Invoked by the /spec
  orchestrator, never a user entry point; users reach it through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# Architecture stage

You author `.spec/arch.md`. Internal stage of the spec workflow, invoked by
`/spec` — not a user door.

- **Rubric:** `references/arch.md`.
- **Output:** `.spec/arch.md`.
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).
