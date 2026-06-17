# Stage contract

Every authoring **stage skill** (`charter`, `guidelines`, `personality`, `stack`,
`domain`, `arch`, `ux`, `prd`, `feat`, `adr`) follows this contract. The skill
authors exactly one artifact and nothing else; `/spec` owns everything around it —
prerequisites, critique, the confirmation gate, capture deposit, advancing (the
wrapper in `authoring-procedure.md`). A stage skill is never a user door; users
reach it through `/spec`.

## What /spec passes you (args)

- `mode` — `create` (artifact absent), `regenerate` (replace an existing one),
  `adjust` (the gate returned Adjust; re-grill one dimension only), or `slice`
  (lean track: fold in one provided slice without a full grill — see _Slice mode_).
- `seeds` — pending hypotheses captured earlier. Treat each as a recommended
  default to confirm or steer, never a settled fact (grilling engine, _Seeds_).
- `adjust_dimension` — present only when `mode: adjust`; the one dimension to revise.
- `slice` — present only when `mode: slice`; the specific material to fold in (a
  term, a boundary, a surface, a tool) and the dimension it belongs to.

## Run

1. Load your rubric bundle (named in your SKILL.md) — persona, probes, dimensions,
   seeds, branching cues, invariants, template — plus any companion it names.
2. Run the grilling engine (`grilling-engine.md`) against the rubric: lead with
   expert proposals the user confirms or steers, one question per turn, applying
   the rubric's probes and the specification bar (`specification-bar.md`). Inject
   the `seeds` as starting hypotheses.
3. Write the artifact from the rubric's template once the engine's bar scan reports
   zero failures. Record only stance-changing interventions in `## Interaction
   notes`.
4. Hand the **decision ledger** (one line per dimension + its provenance tag) back
   to `/spec` for the confirmation gate. Stop there — do not advance.

**`adjust` mode:** re-grill only `adjust_dimension`, rewrite that part of the
artifact, refresh the ledger, and hand back. Do not re-grill settled dimensions.

**`slice` mode (lean track):** do not run the dimension loop. Take the provided
`slice`, confirm or steer it in one focused exchange only if it is underspecified,
then fold it into the artifact — creating the artifact born `ready` (frontmatter +
that one slice) if absent, or extending it (and bumping its version + changelog) if
present — applying the specification bar to that slice. Leave the rest of the
artifact untouched. Return the one-line ledger entry for the slice; `/spec`'s caller
(the PRD/FEAT that drove it) surfaces the addition at its own gate, so a slice has
no separate confirmation gate of its own.

## Constitution

Operate under the constitution injected at session start — voice, localization
(write the artifact in `language.artifacts`), and `AskUserQuestion` rules. If it is
not in context, read `constitution.md` first.

## Boundaries

- You do **not** run `/audit`, `/consistency`, the confirmation gate, `/detector`,
  capture deposit, or `project.json` writes — those are `/spec`'s wrapper. Running
  them here double-runs them.
- You author your one artifact only. Material that belongs to another artifact is
  **parked** (grilling engine, _Branching_), not written — `/spec`'s detector pass
  routes it after the gate.
- You never advance to the next stage; you return control to `/spec`.
