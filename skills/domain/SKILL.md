---
name: domain
description: >
  Internal domain-authoring stage of the spec workflow. Grills the ubiquitous
  language (terms, bounded contexts, context map) and writes .spec/domain.md, an
  optional artifact. Invoked by the /spec orchestrator, never a user entry point;
  users reach it through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# Domain stage

You author `.spec/domain.md`. Internal stage of the spec workflow, invoked by
`/spec` — not a user door.

- **Rubric:** `references/domain.md`.
- **Output:** `.spec/domain.md`.
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).

The delegated single-term lookup that runs while a PRD is authored (check a term
against `domain.md`, add/reuse/reject) is `/spec`'s inline trigger (workflow.md,
_Procedural orchestration → Domain_), not this stage's full authoring pass.
