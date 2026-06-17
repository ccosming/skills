# Plugin refactor — design & execution plan

Living document. Goal: make the plugin **more organized, efficient, and
maintainable**, with a clean user-facing surface. Authored from a structured
design grilling; this file is the source of truth for the effort and tracks
phase status.

## Decisions (locked)

| # | Axis | Decision |
| - | ---- | -------- |
| 1 | Categorizer | Internal **subagent** invoked by `/spec`. Runs a deterministic checklist, classifies the project into a track, and **returns** the verdict; `/spec` writes `category` into `project.json` via the single-writer coordinator (invariant preserved). Not a user-facing command. |
| 2 | Tracks | **Two: `lean` / `full`.** |
| 3 | Orthogonal artifacts (lean) | **Slice-incremental, seeded by the PRD.** Each PRD/FEAT adds only the slice it needs (a term, a boundary, a surface, a tool) to the orthogonal artifact, with the specification bar applied per slice. The artifact is purely accretive; detector + consistency guard coherence. |
| 4 | Decomposition | **One skill per authoring stage** (`user-invocable: false`): charter, guidelines, personality, stack, domain, arch, ux, prd, feat, adr. Each owns its rubric + stage orchestration. `/spec` becomes a **thin router** that resolves prerequisites, dispatches the stage, and **wraps** each dispatch with the cross-cutting steps (gate, critics, detector, captures, state) — cross-cutting lives in **one place**, never duplicated across stage skills. |
| 5 | Subagents | **All non-interactive heavy work runs in subagents:** categorizer, research, audit, consistency, detector (already), plus **drafting** (grilling collects the Q&A in the main context → a drafting subagent receives the Q&A + the rubric template → returns the artifact body + a bar self-check) and **fan-out** (each FEAT/ADR drafted by a parallel subagent from the PRD; the user reviews at the gate). The interactive grilling stays in the main context. |
| 6 | Organization | **Flat folders, clean names, no scope prefix.** Scope grouping is documented in `CLAUDE.md` (a skill→scope manifest). |

## Target architecture

```text
/spec (thin router)
 ├─ reads project.json → category (lean|full) → decides the next stage
 ├─ dispatches the stage to its owning skill (Skill tool, in main, interactive)
 └─ WRAPS each dispatch with cross-cutting (one copy):
       prerequisites · gate · critics · detector · captures · state

Stage skills (user-invocable: false): charter · guidelines · personality ·
   stack · domain · arch · ux · prd · feat · adr
   └─ each: load rubric dimensions → grilling (main) →
        delegate DRAFTING to a subagent → receive body + bar self-check

Subagents (never touch main): categorizer · research · audit · consistency ·
   detector · drafting · fan-out (FEAT/ADR in parallel)

Shared backbone (references/, one copy): authoring procedure ·
   grilling engine · specification bar · artifact model
```

## Three mechanisms the plan requires

1. **Rubric split.** Each rubric splits into (a) *dimensions + question seeds*
   (slim; enters the main context for the interactive grilling) and (b)
   *template + bar mechanics + examples* (heavy; only the drafting subagent
   loads it). This split is what delivers the token saving of decision 5 — the
   ~300-line template never touches the main context.

2. **Shared backbone.** Universal authoring procedure + grilling engine +
   specification bar + artifact model live in plugin-wide `references/`,
   referenced by `/spec` (the wrapper) and by every stage skill (the grilling
   loop). One copy — the antidote to the duplication trap.

3. **`category` in project.json + migration.** `project.json` gains a `category`
   field. **If absent → default `full`** (today's behavior), so existing
   `.spec/` projects keep working untouched. The categorizer runs only for new
   projects at charter close, or on demand for existing ones.

## Execution — phased (each independently testable; backward-compat held)

- [x] **Phase 1 — Backbone, no behavior change.** Extract the universal
  authoring procedure (and consolidate the grilling engine + bar + artifact
  model) into plugin-wide `references/`; shrink `workflow.md` to *the program*
  (artifact registry, reactivity tiers, dependency table, triggers, flows,
  procedural orchestration). Verification: a `/spec` run produces the same
  artifacts as before.
  - **Done.** `references/` is now the backbone (constitution · artifact-model ·
    specification-bar · authoring-procedure · grilling-engine · diagrams).
    `grilling-engine.md` moved here (paths re-pointed); `authoring-procedure.md`
    extracted from `workflow.md` (445 → 405 L). `/spec` reads both the program and
    the procedure at start, so behavior is preserved by construction. All cross-
    references verified resolving. Behavioral check (a `/spec` run) is the next
    live test.
- [ ] **Phase 2 — One pilot stage.** Decompose `charter` end-to-end as the
  template (stage skill + rubric split + the `/spec` wrapper). Validate, then
  replicate to the remaining stages.
- [ ] **Phase 3 — Categorizer + tracks + lean.** Categorizer subagent +
  deterministic checklist; `category` field + migration default; slice-
  incremental orthogonal artifacts on the lean track.
- [ ] **Phase 4 — Drafting + fan-out in subagents.** Move drafting and FEAT/ADR
  fan-out to parallel subagents (relies on the rubric split from Phase 2).

## Risks watched

- **Interactivity vs subagents** — the grilling is never forked; only
  non-interactive drafting/fan-out run in subagents.
- **Cross-cutting drift** — mitigated by keeping the gate/critics/detector/
  captures wrapper in `/spec` only (one place), not in the stage skills.
- **Clean menu** — visible doors stay intact: `spec`, `code`, `commit`, `merge`,
  `ideate`, `grill`, `create-skill`, `humanizer`. Everything spec-internal is
  hidden (`user-invocable: false`).
- **Refactor volume** — large; the four phases are independent and reversible,
  and every phase preserves backward compatibility for existing `.spec/`
  projects.
