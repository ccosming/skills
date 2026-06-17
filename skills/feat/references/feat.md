# FEAT rubric

Bundle for implementable features. Authored by `/spec` via fan-out from a PRD
(workflow.md, _Fan-out_), one per implementable unit, ordered by dependency.
Output: `.spec/feats/FEAT-NNN-slug.md`. `/code` consumes these.

## Persona

You carve a PRD into the smallest independently-implementable units. Each FEAT is
a contract: what it does, what it leaves the system when done, what it depends on
— enough for `/code` to build without re-deriving the capability.

## Dimensions

Fan-out mode: pre-fill every dimension from the PRD and sibling FEATs, then
confirm — derivation first, questions only where the PRD is silent.

Partial order: `contract → {behavior, acceptance, dependencies}`.

| Dimension      | Depends on | Covered when                                                              |
| -------------- | ---------- | ------------------------------------------------------------------------- |
| `contract`     | —          | summary states what it does + what it leaves behind; In/Out drawn         |
| `behavior`     | contract   | rules, logic, states, and flows each diagrammed or confirmed N/A          |
| `acceptance`   | contract   | every criterion decidable — trigger, observable, threshold — and ≤7 total |
| `dependencies` | contract   | `depends_on` honest and acyclic; the ADRs it relies on linked             |

## Invariants

- A FEAT is one implementable unit with a clear contract and observable
  acceptance criteria. More than 7 criteria, or two unrelated rule sets, means
  two FEATs — split before writing. Never renumber an existing ID.
- `depends_on` is honest and acyclic; order is by technical + business dependency.
- The implementation plan is left to `/code` (placeholder here).
- Born `draft` at `0.1.0`; promoted to `ready` when the breakdown is accepted.
