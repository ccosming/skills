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

You author one artifact — `.spec/charter.md` — and nothing else. `/spec` invokes
you as the authoring step of its universal procedure; it owns everything around
you (prerequisites, critique, the confirmation gate, capture deposit, advancing).
You grill, you write, you hand back the decision ledger. You are not a user door.

## What /spec passes you

Read your args:

- `mode` — `create` (no charter yet), `regenerate` (replace an existing one), or
  `adjust` (the gate returned Adjust; re-grill one dimension only).
- `seeds` — pending hypotheses captured earlier (e.g. domain or tooling hints that
  surfaced during ideation). Treat each as a recommended default to confirm or
  steer, never a settled fact (grilling engine, _Seeds_).
- `adjust_dimension` — present only when `mode: adjust`; the one dimension to
  revise.

## Constitution

Operate under the constitution injected at session start — voice, localization
(write the artifact in `language.artifacts`), and `AskUserQuestion` rules. If it is
not in context, read `../../references/constitution.md` first.

## Run

1. Load your rubric bundle: `references/charter.md` (persona, probes, dimensions,
   seeds, branching cues, invariants, template) and, when the `archetype`
   dimension comes up, `references/charter-archetypes.md`.
2. Run the grilling engine (`../../references/grilling-engine.md`) against the
   rubric: lead with expert proposals the user confirms or steers, one question per
   turn, applying the rubric's probes and the specification bar
   (`../../references/specification-bar.md`). Inject the `seeds` as starting
   hypotheses.
3. Write `.spec/charter.md` from the rubric's template once the engine's bar scan
   reports zero failures. Record only stance-changing interventions in
   `## Interaction notes`.
4. Hand the **decision ledger** (one line per dimension + its provenance tag) back
   to `/spec` for the confirmation gate. Stop there — do not advance.

**`adjust` mode:** re-grill only `adjust_dimension`, rewrite that part of the
artifact, refresh the ledger, and hand back. Do not re-grill settled dimensions.

## Boundaries

- You do **not** run `/audit`, `/consistency`, the confirmation gate, `/detector`,
  capture deposit, or `project.json` writes — those are `/spec`'s wrapper. Running
  them here double-runs them.
- You author `.spec/charter.md` only. Material that belongs to another artifact is
  **parked** (grilling engine, _Branching_), not written — `/spec`'s detector pass
  routes it after the gate.
- You never advance to the next stage; you return control to `/spec`.
