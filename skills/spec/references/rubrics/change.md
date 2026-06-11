# Change rubric

Bundle for a change request over an existing PRD (not `in-progress`). Authored by
`/spec` via the cascade (workflow.md, _Evolution flow / Cascade procedure_).
Output: `.spec/prs/PR-NNN-slug.md`, plus the cascaded edits across the impact
graph. Born and closed `locked` in the same session.

## Persona

You are a critical reviewer biased to defend system coherence. You are not
complacent: you question the change's motivation, its cost, and its technical
justification. A weak justification ("looks better", "I like it more") is
returned, not applied.

## Dimensions

Partial order: `what → why_now → {cost, alternatives}`.

| Dimension      | Depends on | Covered when                                                                           |
| -------------- | ---------- | --------------------------------------------------------------------------------------- |
| `what`         | —          | the exact sections, criteria, or decisions that change are named                        |
| `why_now`      | what       | the trigger is evidence — new learning, feedback, constraint, original error; taste alone is returned |
| `cost`         | what       | re-work of `done` FEATs, invalidated ADRs, and contract breaks each priced              |
| `alternatives` | why_now    | ≥1 discarded alternative — a single-option change is challenged                         |

## Invariants

- Trivial change (typo, wording) → stop, suggest editing directly, no PR.
- Huge change (rethinks the capability) → stop, suggest a new PRD via fan-out and
  deprecating the current one.
- PRs are **immutable**; born and closed `locked` at `1.0.0` in the same session.
- A `locked` ADR is never edited — supersede with a new one, mark the old
  `deprecated`. Each touched file gets `PR-NNN` in `prs:`, a changelog row with
  the resulting version, and a SemVer bump per its own impact.

## Template

```markdown
---
id: PR-NNN
status: locked
version: 1.0.0
target: PRD-NNN
affects:
  prds: [PRD-NNN, ...]
  adrs: [ADR-NNN, ...]
  feats: [FEAT-NNN, ...]
  orthogonal: [charter, guidelines, personality]
---

# <Summary>

## Motivation

<What problem in the current system leads to this change. Cite evidence,
feedback or decision.>

## Requested change

<Specific description of what is modified, without ambiguity.>

## Evaluated alternatives

- **<Option A>** — discarded due to <…>.
- **<Option B>** — discarded due to <…>.

## Cascade impact

| File                                       | Change        | Type                            |
| ------------------------------------------ | ------------- | ------------------------------- |
| [PRD-NNN slug](../prds/PRD-NNN-slug.md)    | <description> | edit                            |
| [ADR-NNN slug](../adrs/ADR-NNN-slug.md)    | <description> | edit \| deprecation \| creation |
| [FEAT-NNN slug](../feats/FEAT-NNN-slug.md) | <description> | edit \| invalidation            |

## User decision

<What was approved via AskUserQuestion: subset or whole.>

## Result

<Final state of each file after application.>

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                                          |
| ---------------- | ------- | ------------------------------------------------------------------------------------ |
| YYYY-MM-DD HH:MM | 1.0.0   | PR creation and closure (born and remains locked). <Synthesis of motive and scope>.  |
```
