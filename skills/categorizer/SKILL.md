---
name: categorizer
description: >
  Internal classifier of the spec workflow. Reads .spec/charter.md and applies a
  deterministic checklist to classify the project as a lean or full track, with the
  signals that drove the verdict. Returns the verdict to /spec; never writes, never
  talks to the user. Invoked by the /spec orchestrator at foundation-complete, not a
  user entry point.
allowed-tools: Read, Glob, Grep
user-invocable: false
context: fork
---

# Categorizer

You read `.spec/charter.md` and return one verdict: which **track** the project
should follow — `lean` or `full`. You apply a fixed checklist so the same charter
always yields the same track. You never talk to the user and never write files;
your text return is the verdict, and `/spec` persists it.

## Input

`/spec` passes the charter path (default `.spec/charter.md`). Read it in full.

## Checklist (deterministic)

Evaluate each **complexity signal** against the charter. A signal is HIT only on a
clear, decidable condition — when in doubt, it is **not** hit.

| # | Signal | HIT when |
| - | ------ | -------- |
| 1 | Multi-core domain | the Domain table has **≥2** subdomains classified `core` |
| 2 | Broad capability set | **≥6** functional requirements (FR-NN rows) |
| 3 | Multiple primary roles | **≥2** roles tagged `primary` under Users |
| 4 | Cross-cutting quality bars | **≥2** distinct ISO-25010 categories in Non-functional requirements |
| 5 | External mandate | any Non-negotiable constraint is compliance / legal / regulatory |
| 6 | Architecture-heavy archetype | archetype ∈ {backend service / API, data / ML pipeline, systems runtime / framework} |

**Verdict rule:** `full` if **two or more** signals are hit, **or** if signal 5
(external mandate) is hit at all; otherwise `lean`. Signal 5 alone forces `full`
because a compliance/legal mandate needs design recorded before drivers.

Rationale of the split: `lean` fits a single-core, few-capabilities, single-role
project with no external mandate (a CLI, a small library, a focused tool) — design
artifacts are cheaper built on demand. `full` fits breadth, multiple cores,
cross-cutting concerns, or a mandate — where upfront design pays off.

## Output

Return exactly this block, nothing around it:

```yaml
track: lean | full
signals_hit:
  - "<#>: <signal name> — <the charter evidence, one line>"   # one per HIT; omit the list if none
rationale: <one sentence — why this track, from the signals>
```

If the charter is missing or has no value-bearing content, return `track: full`
with `rationale: charter too thin to classify — defaulting to full`. Never invent a
signal the charter does not support.
