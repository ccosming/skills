# Optimization roadmap

Curated backlog of changes that improve the plugin's **performance, reasoning,
token efficiency, and output quality**. One file, append-only item blocks, each
with a stable code and an explicit status.

Scope — this file holds **optimizations**: deliberate engineering improvements to
the plugin itself. It is **not** a test log. An item may be *motivated* by a
live-test observation, but only the optimization — with its own measured
evidence — is recorded here.

## How to use this file

### Registering an item

1. Assign the next free code: `OPT-NNN`, zero-padded, monotonic, **never reused**
   (start at `OPT-001`; codes are permanent even after an item is `done`/`dropped`).
2. Append a new block at the end of `## Backlog` using the **Item template**.
   Never renumber or reorder existing items — append only.
3. Fill every field. If a value is unknown, write `TBD` — never leave it blank.
4. Default status on creation is `proposed`.

### Item lifecycle (status)

```
proposed ──► accepted ──► in-progress ──► done
                 │             │
                 ├──► deferred  (parked; revisit later)
                 ├──► blocked   (waiting on an external/unresolved dependency)
                 └──► dropped    (decided against; keep the block, record why)
```

- Only the user moves an item `proposed → accepted` (greenlight). Do not start
  implementing a `proposed` item without that approval.
- `done` requires the **Acceptance** check to pass and a one-line measured result
  in **Resolution**.

### Picking up an item (implementation playbook)

When a future session takes an item to implement, do this in order:

1. Read the **entire** block — context, proposal, acceptance, risk/watch, and
   every link (files, measurements, related items).
2. Read each target file and any linked evidence **before** editing.
3. **Measure the baseline** named in Acceptance (run the command, record the
   number) so "better" is provable, not asserted.
4. Implement to the proposal. Honor every risk/watch line — those are the ways
   this change can regress something already working.
5. **Re-measure** against Acceptance. If it does not pass, the item is not `done`.
6. Update the block: set `status: done`, fill **Resolution** (what changed +
   measured before→after), bump `updated`. If new work surfaced, register it as a
   fresh item and cross-link.
7. Commit the real change through the normal commit flow (Conventional Commits).
   **Never cite `OPT-NNN` codes, this file, or internal working notes in commit
   messages or shipped repo content** — those are internal process labels.

### Maintaining the file across sessions

- Blocks are **append-only**. After creation, only `status`, `updated`, and
  **Resolution** change. This keeps stable anchors and avoids document rot.
- One concern per item. If an item grows two distinct goals, split it and link.
- This roadmap answers *what to optimize next*. Keep test-run narrative out of
  it — capture only the actionable optimization and its measured evidence.

## Item template

```
### OPT-NNN — <short title>

- **status:** proposed | accepted | in-progress | blocked | deferred | done | dropped
- **category:** performance | reasoning | token-efficiency | quality | maintainability
- **priority:** P1 (high) | P2 | P3
- **impact:** <expected benefit, one line>
- **effort:** S | M | L
- **targets:** <files / areas this touches>
- **created:** YYYY-MM-DD · **updated:** YYYY-MM-DD
- **links:** <files, related OPT-NNN, external refs>

**Context.** Why this matters; the evidence/measurement that motivates it.

**Proposal.** What to change, concretely.

**Acceptance.** The provable done-condition — a command + threshold, a metric, a
check. "Done" = this passes.

**Risk / watch.** What could regress; what to verify it did not.

**Resolution.** (Filled on `done`: what changed + measured before→after.)
```

## Backlog

### OPT-001 — Constitution under the 10K hook-inline threshold

- **status:** proposed
- **category:** token-efficiency (primary) · reasoning/quality · performance
- **priority:** P2
- **impact:** cuts the per-session token cost of the constitution and removes the
  persisted-file `Read` in fresh sessions; a leaner ruleset is also easier for the
  model to apply every turn.
- **effort:** M
- **targets:** `references/constitution.md`, `hooks/inject.py`, possibly new
  `references/*.md`; verify each skill's "read the constitution" clause still
  resolves.
- **created:** 2026-06-05 · **updated:** 2026-06-05
- **links:** measured baselines below; foundation-injection follow-up (to be
  registered as its own item).

**Context.** `inject.py` prints the constitution (plus the foundation when
`.spec/` is bootstrapped) to stdout at `SessionStart`. Claude Code inlines hook
stdout only up to **~10,000 characters**; above that it persists the output to a
file, shows a 2KB preview, and the model must `Read` that file each session to
get the full rules. Measured baselines (2026-06-05): `references/constitution.md`
= **16,778 chars**; `inject.py` stdout (fresh, no `.spec/`) = **16,940 chars** —
~7K over the limit. Earlier measurements were also over (≈13.6K), so the
constitution has always exceeded the threshold.

**Proposal.** Bring the constitution's own contribution under the limit by:
(a) **condensing prose** with prompt-engineering discipline — imperative voice,
one rule per concept, kill redundancy, restatements, and meta-commentary; and
(b) **moving non-normative detail** (long rationale paragraphs, extended example
tables) into `references/*.md` loaded on demand, keeping the **normative rules**
inline. Where a moved example was load-bearing, leave an inline one-line rule
with a pointer so the rule keeps its teeth.

**Acceptance.**
- `wc -c references/constitution.md` ≤ **9,500** (headroom for inject's wrapper).
- `python3 hooks/inject.py` in a **fresh** project (no `.spec/`) emits stdout
  **< 10,000 chars** → inlines, no persisted-file `Read`.
- **No normative rule lost**: every rule is still present inline, or replaced by
  an inline one-line pointer to a `references/` file that carries the detail.
- A live cycle after the change shows **no re-emergence** of the voice / cadence /
  localization deviations the inline examples were guarding.

**Risk / watch.**
- **Foundation interaction (scoping limit).** In a *bootstrapped* project,
  `inject.py` also appends `charter.md` + `guidelines.md` + `personality.md`, so
  the **combined** output will likely still exceed 10K and persist. This item only
  guarantees the *constitution's* budget — keeping bootstrapped sessions inline is
  a **separate concern** (foundation injection strategy). Flag it, do not solve it
  here.
- **Load-bearing examples.** The constitution includes Bad/Good tables (Voice
  cold-open, Cadence prose-bundling, Localization tiering) that guard against real
  deviations. Moving them out of the inline core risks reintroducing those. Keep
  them inline as long as the budget allows; if one must move, leave an inline rule
  + pointer.
- **Default-visibility shift.** Today the full constitution is read once and is
  then *entirely* in context. A shrink that relocates detail to `references/`
  means the model sees less by default unless a skill reads the reference. Measure
  the net token/quality effect; do not assume the move is free.

**Resolution.** (pending)

### OPT-002 — Document ingestion as a flow entry (enrich charter/domain from user-provided files)

- **status:** in-progress
- **category:** quality (primary) · reasoning
- **priority:** P3
- **impact:** lets a user feed source files they already have (notes, papers/PDFs,
  third-party markdown) and have their substance seed the charter and domain as
  captures, instead of re-typing it into the grilling.
- **effort:** L
- **targets:** a new forked ingestion delegate (or a rubric-backed step);
  `skills/spec/references/workflow.md` (a new trigger row + bootstrap touchpoint);
  possibly `skills/research/`; the capture model in `hooks/project_file.py`.
- **created:** 2026-06-15 · **updated:** 2026-06-16
- **links:** charter/domain rubrics; the capture/trigger system in
  `workflow.md` (_Cross-artifact triggers_); constitution _Data boundary_.

**Context.** The flow has no path to ingest source documents the user already
holds. An earlier design sketch included a triage step that reads provided
files (notes, PDFs, papers, spreadsheets) and distills them to enrich the
domain. This is the one idea from that sketch with no current equivalent:
`/research` covers world facts, not the user's own files. It is most valuable
for knowledge/content projects whose raw material *is* a corpus of documents,
where today the user must restate that material by hand during the charter and
domain grilling.

**Proposal.** Add a consent-driven ingestion entry that reads **only** files the
user explicitly provides or points to, extracts candidate domain terms,
constraints, and capabilities, and deposits them as `pending` captures (`for:
charter` / `for: domain`) through the coordinator — never auto-baking. The
grilling then surfaces them as seeds to confirm or steer. Decide the shape: a
forked helper like `/research`, or a rubric-backed bootstrap touchpoint. Keep it
inside the existing capture/trigger model; do not add a parallel pipeline.

**Acceptance.** Given a project and N user-provided source files, invoking the
ingestion deposits captures into `project.json` (each tracing to a source file),
and a subsequent charter/domain grilling surfaces them as seeds reaching the
artifact through the gate — never auto-written. A live cycle shows material from
a provided file landing in the artifact only after an explicit `Accept`.

**Risk / watch.**
- **Data boundary.** Read only files the user explicitly hands over or names;
  never scan the project tree or sibling directories unsolicited (constitution,
  _Data boundary_).
- **No gate bypass.** Ingested material is a hypothesis, not a fact — it must
  enter as a `pending` capture and pass the grilling/gate, not skip them.
- **Extraction fidelity.** PDFs/spreadsheets/images vary; a low-confidence
  extraction must be surfaced as such, not asserted as a settled term.

**Note (2026-06-16).** Implemented broader than the original framing: as the
`/ideate` ideation front door (a standalone concept whitepaper → global
`~/.ccosming/ideas/` vault or project `.ideas/`), with file ingestion folded in
as one way to start a session, and `/spec` seeding the foundation from a closed
whitepaper via `/detector`. Pending live validation in a clean run.

**Resolution.** (pending)
