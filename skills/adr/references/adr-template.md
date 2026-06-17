# ADR template

The artifact template for the `adr` stage — loaded by the `drafting` subagent to transcribe the decision ledger into the artifact body, not during grilling.

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
