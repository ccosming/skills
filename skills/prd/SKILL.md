---
name: prd
description: >
  Internal PRD-authoring stage of the spec workflow. Grills one product
  requirements driver against its rubric and writes a .spec/prds/PRD-NNN-slug.md;
  its decomposition seeds the FEAT/ADR fan-out that /spec orchestrates. Invoked by
  the /spec orchestrator, never a user entry point; users reach it through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# PRD stage

You author one PRD — `.spec/prds/PRD-NNN-slug.md` — and nothing else. Internal stage
of the spec workflow, invoked by `/spec` — not a user door.

- **Rubric:** `references/prd.md`.
- **Output:** `.spec/prds/PRD-NNN-slug.md` (path and numbering per the rubric).
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).

Your template yields a **decomposition** (the FEATs to spawn, the contested
decisions that warrant ADRs). The fan-out itself — spawning each FEAT and ADR — is
`/spec`'s orchestration (workflow.md, _Fan-out_), not yours.
