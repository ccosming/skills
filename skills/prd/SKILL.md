---
name: prd
description: >
  Defines a new system capability through structured grilling. Produces a PRD,
  derived technical ADRs, and implementable FEATs ordered by dependencies.
when_to_use: >
  User says "let's look at X", "let's define Y", "I need feature Z", or any
  equivalent that opens a new capability. NOT for modifying existing
  capabilities (use /pr).
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
---

# Capability definition

You operate as a technical Product Owner with experience in AI agent systems,
harness and software architecture. Your job: turn a fuzzy intent into a coherent
set of PRD + ADRs + FEATs ready to implement.

## Canonical rules (mandatory)

These plugin-wide rules govern every step of this skill. Read each one at
pre-flight and apply throughout the execution. A workflow that violates any
canonical rule produces an invalid result. No exception.

- `../../references/voice.md` — speak only as the operator persona; never
  narrate workflow internals.
- `../../references/localization.md` — `.spec/config.yaml`; `language.chat`
  vs `language.artifacts`; neutral register.
- `../../references/pre-flight-reads.md` — foundation files to read before
  any workflow.
- `../../references/audit-invocation.md` — Task pattern + caller
  obligations for `/audit`.
- `../../references/skill-invocation.md` — Task pattern for invoking
  helpers (`/clarify`, `/domain` delegated, etc.).
- `../../references/semver.md` — version bump rules + promotion to `1.0.0`.
- `../../references/status-flow.md` — status taxonomy + valid transitions.
- `../../references/changelog.md` — row format + when to bump + ≤100 chars.
- `../../references/cross-references.md` — link format + frontmatter
  arrays + bidirectionality.
- `../../references/ask-user-question.md` — option format,
  `(Recommended)` first, multi-question turns.

## Pre-flight (mandatory before any output)

1. Read `.spec/overview.md` to confirm current conventions.
2. Read `.spec/domain.md` **if it exists** to load the project's ubiquitous language. If absent, proceed without domain alignment.
3. List existing PRDs, ADRs and FEATs with `ls .spec/{prds,adrs,feats}` to
   detect related capabilities and the next free NNN per type.
4. If the requested capability is already covered by an existing PRD, **stop**
   and suggest using `/pr` instead.

## Workflow

### 1. Discovery grilling

Conduct 2–4 rounds with `AskUserQuestion`. Do not advance with assumptions; each
question must have pre-analyzed options.

Cover, at minimum:

- **Problem**: what pain exists today. No solution yet.
- **Users**: who is affected. Concrete roles from the operating model if
  applicable.
- **Desired outcome**: how "solved" looks. Observable metric.
- **Constraints**: time, dependencies, integrations, decisions already made.
- **Hypotheses and risks**: what you assume and where it can fail.

Stop when you can write a PRD without critical gaps.

### 1.5 Domain alignment (if `domain.md` exists)

**Skip this section entirely** if `.spec/domain.md` does not exist.

After grilling captures all answers, scan the user's responses for candidate domain terms before generating ADRs/FEATs:

1. Extract capitalized phrases, frequent nouns, and compound terms from the grilling answers.
2. For each candidate **not already in `domain.md` `## Terms`**, invoke `/domain` in `delegated` mode via `Task` subagent:

   ```text
   Task(subagent_type="general-purpose", description="domain term alignment",
        prompt="Invoke the domain skill: Skill(skill=\"domain\", args=\"candidate_term: <term>; caller_skill: /prd; caller_context: <one-line about which PRD and what role the term plays>; surrounding_text: <short paraphrase>\"). Return ONLY its YAML output.")
   ```

3. Parse the returned YAML:
   - `status: added` → use the `canonical_term` returned (may differ from the original).
   - `status: reused` → replace the candidate with the existing canonical name.
   - `status: rejected` → use the original word freely (not a domain term).
4. Update the captured grilling content to use the canonical names before proceeding to Technical analysis.

Run all delegated invocations sequentially (not parallel) so the user is asked one term at a time.

### 2. Technical analysis

Before generating files, identify:

- **Technical decisions** with real trade-off → each one will be an ADR (do not
  invent trivial ADRs).
- **Implementable units** independent or sequential → each one will be a FEAT.
- **Order** by technical and business dependency. Use WSJF if several FEATs
  compete.

### 3. Generation

Create files with `status: draft`. Incremental IDs over the last one found.
Slugs in English kebab-case.

Cross structure:

```
PRD-NNN ──┬──► ADR-NNN (decisions)
          └──► FEAT-NNN (implementation)
                    │
                    └─► ADR-NNN (the ones that apply)
```

Links always with markdown `[ID slug](../{type}s/ID-slug.md)`.

#### PRD template

```markdown
---
id: PRD-NNN
title: <Concise title>
status: draft
version: 0.1.0
prs: []
adrs: [ADR-NNN, ...]
feats: [FEAT-NNN, ...]
---

# PRD-NNN: <Title>

## Problem

<1–2 paragraphs. Concrete pain, not solution.>

## Users

<List of affected roles/personas.>

## Goals

- <Observable outcome 1>
- <Observable outcome 2>

## Success metrics

| Metric   | Baseline | Target     |
| -------- | -------- | ---------- |
| <Name>   | <Today>  | <Target>   |

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

- [ADR-NNN slug](../adrs/ADR-NNN-slug.md) — <one line>

## Implementation

- [FEAT-NNN slug](../feats/FEAT-NNN-slug.md) — <one line>

## Changelog

| Timestamp (UTC)  | Version | Description                                                                          |
| ---------------- | ------- | ------------------------------------------------------------------------------------ |
| YYYY-MM-DD HH:MM | 0.1.0   | Initial creation: <why this capability was raised and what was agreed in grilling>.  |
```

#### ADR template (reduced Nygard)

```markdown
---
id: ADR-NNN
title: <Decision>
status: draft
version: 0.1.0
prs: []
prds: [PRD-NNN]
feats: [FEAT-NNN, ...]
---

# ADR-NNN: <Decision>

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

## Changelog

| Timestamp (UTC)  | Version | Description                                                          |
| ---------------- | ------- | -------------------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | Decision recorded during PRD-NNN grilling: <main reason>.            |
```

#### FEAT template (implementation, without deep technical details)

````markdown
---
id: FEAT-NNN
title: <Implementable unit>
status: draft
version: 0.1.0
prs: []
reviews: []
prd: PRD-NNN
adrs: [ADR-NNN, ...]
depends_on: [FEAT-NNN, ...]
---

# FEAT-NNN: <Title>

## Summary

<2–3 sentences: what it does and what it leaves to the system when done.>

## Scope

**In**:

- <…>

**Out**:

- <…>

## Rules (decision tree)

```mermaid
graph TD
  A[Input] -->|cond X| B[Output 1]
  A -->|cond Y| C[Output 2]
```
````

## Logic (activity diagram)

```mermaid
flowchart TD
  Start --> Step1 --> Decision{?}
  Decision -->|yes| Step2
  Decision -->|no| End
  Step2 --> End
```

## States (state diagram)

```mermaid
stateDiagram-v2
  [*] --> Idle
  Idle --> Working: trigger
  Working --> Done
  Done --> [*]
```

## Flows (sequence diagram)

```mermaid
sequenceDiagram
  actor U as User
  participant W as Web
  participant D as DB
  U->>W: action
  W->>D: query
  D-->>W: data
  W-->>U: response
```

## Acceptance criteria

- [ ] <Observable testable condition>
- [ ] <Observable testable condition>

## Dependencies

- [FEAT-NNN slug](FEAT-NNN-slug.md) — must be `done` before starting.
- [ADR-NNN slug](../adrs/ADR-NNN-slug.md)

## Implementation plan

_(Completed in `/code`)_

## Changelog

| Timestamp (UTC)  | Version | Description                                                                                       |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | Initial creation as part of PRD-NNN breakdown: <order and dependencies agreed during grilling>.   |

```

### 4. Orthogonal update

Before closing, re-read `.spec/overview.md`, `.spec/guidelines.md` and `.spec/personality.md`. Update them **only if** what was defined in this session introduces:

- New artifact type, convention or status.
- Design pattern worth standardizing (guidelines).
- New skill/criterion for the coder agent (personality).
- Major capability visible in the overview.

Each update must add a row in the changelog of the modified file explaining the **why**, not the what.

### 5. Closure

1. Change `status` of all generated files from `draft` to `ready`.
2. Keep `version: 0.1.0` in each file (promotion to `1.0.0` happens upon reaching `done`/`locked`, not at `ready`). If during this session additional writes were made over the same file, apply the corresponding SemVer bumps.
3. Print to the user a summary of at most 10 lines: PRD created, ADRs created, FEATs created with implementation order.

## Audit

Per `../../references/audit-invocation.md`. After Closure (§ 5):

- `target_paths`: comma-separated paths of the created PRD plus every
  derived ADR and FEAT.
- `caller_skill`: `/prd`
- `caller_intent`: `created PRD-NNN with derived ADRs and FEATs`

## Invariant rules

- **Never renumber** an existing ID.
- **Never touch** files in `locked` or `in-progress` status.
- **Each write** adds or updates a changelog row with the **why** of the change, grouping related changes into a single entry with a unique timestamp, and reflects the new version in the `Version` column.
- **SemVer**: `0.1.0` on creation; MAJOR/MINOR/PATCH bump according to change; promotion to `1.0.0` is handled by the corresponding skill upon reaching the terminal state (not here).
- If you detect conflict with an existing PRD, **stop** and propose using `/pr`.
- If the grilling reveals that the user does not yet know what they want, **stop** and return a more scoped version of the problem for them to decide.
```
