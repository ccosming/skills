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

1. Load your **dimensions** rubric (named in your SKILL.md — `<name>.md`: persona,
   probes, dimensions, coverage, seeds, branching cues, invariants) plus any
   companion it names. You do **not** load the artifact template — the drafter does.
2. Run the grilling engine (`grilling-engine.md`) against the rubric: lead with
   expert proposals the user confirms or steers, one question per turn, applying the
   rubric's probes and the specification bar (`specification-bar.md`). Inject the
   `seeds` as starting hypotheses. The engine's product is a **decision ledger** —
   one confirmed fact per dimension, each with its provenance tag.
3. **Draft via the drafter (forked).** When the ledger is complete, write it to a
   temp input file (`~/.ccosming/spec-inbox/<artifact>-draft.md`; resolve `~` at
   runtime — the dir is pre-approved for `Write`), then dispatch:
   `Skill(skill="drafting", args="artifact: <name>; input: <that temp path>; output:
   <artifact path>; language: <language.artifacts>")`. The drafter loads only the
   template (`<name>-template.md`), transcribes the ledger into the body, and returns
   `--- body ---` plus a `--- bar ---` self-check. If the bar reports failures,
   re-grill those lines and re-draft; once clean, write the returned body verbatim to
   the artifact path and add `## Interaction notes` only for stance-changing
   interventions.
4. Hand the **decision ledger** back to `/spec` for the confirmation gate. Stop there
   — do not advance.

**`adjust` mode:** re-grill only `adjust_dimension`, rewrite that part of the
artifact, refresh the ledger, and hand back. Do not re-grill settled dimensions.

**`slice` mode (lean track):** do not run the dimension loop. Read your
`<name>-template.md` for the shape of the section the slice belongs in. Take the
provided `slice`, confirm or steer it in one focused exchange only if it is underspecified,
then fold it into the artifact — creating the artifact born `ready` (frontmatter +
that one slice) if absent, or extending it (and bumping its version + changelog) if
present — applying the specification bar to that slice. Leave the rest of the
artifact untouched. Return the one-line ledger entry for the slice; `/spec`'s caller
(the PRD/FEAT that drove it) surfaces the addition at its own gate, so a slice has
no separate confirmation gate of its own.

## Constitution

Operate under the constitution injected at session start. If it is not in context,
read `constitution.md` first. Write the artifact's content in `language.artifacts`.

## Boundaries

- You do **not** run `/audit`, `/consistency`, the confirmation gate, `/detector`,
  capture deposit, or `project.json` writes — those are `/spec`'s wrapper. Running
  them here double-runs them.
- You author your one artifact only. Material that belongs to another artifact is
  **parked** (grilling engine, _Branching_), not written — `/spec`'s detector pass
  routes it after the gate.
- You never advance to the next stage; you return control to `/spec`.
