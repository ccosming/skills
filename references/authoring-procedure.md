# Authoring procedure

The universal loop `/spec` runs for any rubric-backed artifact. The rubric is the
only thing that varies between artifacts — the loop, the gates, and the
cross-cutting steps (critique, detect/deposit, advance) are identical every time.
The flow tables this procedure consults — the artifact registry, _Dependencies_,
the bootstrap sequence, the impact graph, _Writing it_ — live in the program
(`skills/spec/references/workflow.md`); the craft of each artifact is the rubric's.

Authoring (steps 3, 5–6) takes one of two paths — an inline rubric, or a dispatch
to the artifact's **stage skill** — but the wrapper (steps 1–2, 4, 7–10) is
`/spec`'s and runs identically either way.

1. **Resolve + gate prerequisites.** Map the request to one target. Check its row
   in _Dependencies_ (workflow.md). A missing hard prerequisite routes there
   first, then returns.
2. **Existence + mode.** If the artifact is absent → `create`. If present →
   `AskUserQuestion`: **Keep current** (Recommended — change via the cascade) |
   **Regenerate**. An accretive artifact reached by an impact (workflow.md,
   _Evolution flow_) enters `update` instead of prompting.
3. **Set up authoring.** Decide the path from the target's registry row
   (workflow.md): if it names a **stage skill** (e.g. `charter skill`), authoring
   is delegated to that skill (steps 5–6 happen inside it); otherwise load the
   inline rubric bundle from `skills/spec/references/rubrics/<target>.md`.
4. **Inject seeds.** Read `.spec/project.json`'s `state.captures` for `pending`
   entries `for:` this artifact and pass them to the engine as starting
   hypotheses to confirm or steer.
5. **Grill (or dispatch).** **Stage-skill path:** dispatch
   `Skill(skill="<target>", args="mode: <create|regenerate|adjust>; seeds: <step
   4's seeds>; adjust_dimension: <name, only when mode=adjust>")`; the skill runs
   the grilling engine, writes the artifact (step 6 happens inside it), and returns
   the **decision ledger** — then resume at step 7. **Inline path:** run the
   grilling engine (`grilling-engine.md`) against the rubric, applying its persona
   and probes.
6. **Write** (inline path only). Write the artifact from the rubric's template once
   the engine's bar scan (`grilling-engine.md`, _The bar_) reports zero failures.
   On the stage-skill path the artifact was already written during step 5's
   dispatch.
7. **Critique.** Run `/audit` (structural) and `/consistency` (semantic) **in
   parallel** — both are read-only checks of the written artifact. `error`
   findings block; `warning`/`info` surface as notes. After applying fixes,
   re-run the affected critic — step 8 opens on a clean report, not on the
   author's claim (constitution, _Artifact self-consistency_).
8. **Confirmation gate.** Present the engine's decision ledger **as visible prose
   before the selector** — one line per dimension plus its provenance tag,
   `confirmed`/`default` lines called out for veto (`grilling-engine.md`,
   _Provenance and the decision ledger_). Then `AskUserQuestion`: **Accept &
   continue** (advance to step 10) | **Accept & pause** (lock the artifact and stop
   at a commit point) | **Adjust** (loops to step 5 — the stage-skill path
   re-dispatches with `mode: adjust`). Accept & pause records the artifact as
   accepted, then stops per step 10.
9. **Detect + deposit.** Invoke `/detector` (forked) over the artifact
   (`Skill(skill="detector", args="source_artifact: <path>; from: <artifact>")`);
   deposit **all** returned captures through **the coordinator** (spec SKILL.md,
   _Plugin scripts_). Write the captures as a JSON array to
   `~/.ccosming/spec-inbox/<artifact>-captures.json` (resolve `~` to an absolute
   path at runtime — the dir is pre-approved for `Write`, never `.spec/`), then
   deposit them in **one** static call: `<the coordinator> --project <root>
   add-captures-file <that path>` (the coordinator deletes the file after a
   successful deposit). Mark any seed consumed this pass: `<the coordinator>
   --project <root> update-capture "<seed substring>" consumed`. Every call is a
   single static command (workflow.md, _Writing it_): absolute `--project` root, no
   `cd` / `$(…)` / shell variables. The deposit is a command you run, not a
   displayed block. Never hand-write `project.json`.
10. **Advance** per the bootstrap sequence (workflow.md) — unless the gate chose
    **Accept & pause**: set `next_suggested` to the next stage, leave `in_flight`
    cleared, and stop with a one-line resume handoff (the artifact is `ready`; the
    user runs `/commit`, then re-invokes `/spec` to continue). Otherwise advance, or
    surface the next options and stop.

Steps 1–2, 4, 7–10 are the wrapper — always `/spec`'s, identical for every
artifact. Steps 3, 5–6 are the authoring step: an inline rubric, or a dispatch to
the target's stage skill.
