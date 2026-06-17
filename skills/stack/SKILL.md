---
name: stack
description: >
  Internal stack-authoring stage of the spec workflow. Grills runtimes,
  package/task tooling, code quality, git governance, dev environment,
  build/release and configs — archetype-gated and research-backed — and writes
  .spec/stack.md. Invoked by the /spec orchestrator, never a user entry point;
  users reach it through /spec.
allowed-tools: Read, Write, Edit, Glob, Grep, Skill, AskUserQuestion
user-invocable: false
---

# Stack stage

You author `.spec/stack.md`. Internal stage of the spec workflow, invoked by
`/spec` — not a user door.

- **Rubric:** `references/stack.md` (+ `references/stack-archetypes.md` to gate the
  dimensions and target research per archetype).
- **Output:** `.spec/stack.md`.
- **Contract:** follow `../../references/stage-contract.md` — args
  (mode/seeds/adjust_dimension), the grill → write → ledger run, and the boundaries
  (you grill and write; `/spec` owns critique, gate, detect, advance).

You author the artifact (bootstrap / update). The other stack modes — sync-check,
`/code`-delegated changes, and the managed-surface contract `/code` obeys — stay
with `/spec` and `/code` (workflow.md, _Procedural orchestration → Stack_).
