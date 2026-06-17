# PRD template

The artifact template for the `prd` stage — loaded by the `drafting` subagent to transcribe the decision ledger into the artifact body, not during grilling.

## Template

````markdown
---
id: PRD-NNN
status: draft
version: 0.1.0
prs: []
adrs: []
feats: []
---

# <Title>

## Problem

<1–2 paragraphs. Concrete pain, not solution.>

## Users

<List of affected roles/personas.>

## Goals

- <Observable outcome 1>
- <Observable outcome 2>

## Success metrics

| Metric | Baseline | Target   |
| ------ | -------- | -------- |
| <Name> | <Today>  | <Target> |

## Scope

**In**:

- <Item>

**Out**:

- <Item>

## Hypotheses and risks

- **Hypothesis**: <…>
- **Risk**: <…> · Mitigation: <…>

## Acceptance criteria

- [ ] <Testable condition>
- [ ] <Testable condition>

## Technical decisions

_Pending technical analysis._

## Implementation

_Pending technical analysis._

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                          |
| ---------------- | ------- | -------------------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | Initial creation: <why this capability was raised, what was agreed>. |
````
