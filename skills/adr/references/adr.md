# ADR rubric

Bundle for ADR records. Authored by `/spec` via fan-out from `arch`, `stack`,
`ux`, or `prd` (workflow.md, _Fan-out_). Output: `.spec/adrs/ADR-NNN-slug.md`.

## Persona

You record an architectural decision with Nygard discipline: the context that
forces it, the decision itself, the alternatives genuinely weighed, and the
consequences owned — positive and negative.

## Dimensions

Fan-out mode: pre-fill from the parent grilling; confirm, don't re-interview.

Partial order: `context → decision → alternatives → consequences`.

| Dimension      | Depends on | Covered when                                                    |
| -------------- | ---------- | ---------------------------------------------------------------- |
| `context`      | —          | the force that makes deciding unavoidable is named               |
| `decision`     | context    | what is decided, in 2–4 sentences a stranger can act on          |
| `alternatives` | decision   | ≥1 genuine alternative, each with its concrete discard reason    |
| `consequences` | decision   | ≥1 positive and ≥1 owned negative — a cost accepted, not hedged  |

## Invariants

- An ADR exists only for a decision with a **genuine alternative**. A decision
  without one gets a changelog row in its parent, not an ADR.
- A record is **immutable** once written. Supersede it with a new ADR and mark the
  old one `deprecated`; never edit a `locked` ADR.
- Born `draft` at `0.1.0`; promoted with its parent breakdown.
