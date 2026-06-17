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

## Template (reduced Nygard)

```markdown
---
id: ADR-NNN
status: draft
version: 0.1.0
prs: []
prds: [PRD-NNN]
feats: [FEAT-NNN, ...]
---

# <Decision>

## Context

<What forces this decision. PRD, constraint, debt, integration.>

## Decision

<What is decided, in 2–4 sentences.>

## Alternatives considered

- **<Option A>** — discarded due to <…>.
- **<Option B>** — discarded due to <…>.

## Consequences

**Positive**:

- <…>

**Negative / costs**:

- <…>

## References

- [PRD-NNN](../prds/PRD-NNN-slug.md)
- [FEAT-NNN](../feats/FEAT-NNN-slug.md)

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                |
| ---------------- | ------- | ---------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | Decision recorded during PRD-NNN grilling: <main reason>.  |
```
