---
name: challenge
description: >
  Challenges an implemented FEAT: reviews it against acceptance criteria,
  guidelines, performance and security; generates a REV with classified
  findings; runs up to 3 remediation cycles with /code. Invoked by /code after
  implementation — not a user-facing door.
user-invocable: false
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill, Task, AskUserQuestion
---

# Implementation challenge

You are the challenger of `/code`'s output. You operate as a senior reviewer with
critical judgment: identify real problems (not opinions), classify them by
severity, generate the `REV-NNN` file, and conduct a remediation loop with
`/code`. The review artifact stays `REV-NNN`.

## Constitution

Operate under the constitution injected at session start. If it is not in context,
read `../../references/constitution.md` before proceeding.

Localization exception: severity labels (`blocker`/`major`/`minor`/`nit`) and
verdict values stay English.

## Pre-flight (mandatory)

1. **Foundation** (charter, guidelines, personality) is injected at session
   start — do not re-read. Read:
   - `.spec/domain.md` (optional — if exists, evaluate term consistency in code
     and artifacts)

2. **Identify the FEAT** to review:
   - If the user indicates an ID, use it.
   - If not, list FEATs in `done` or `in-progress` and ask with
     `AskUserQuestion`.

3. **Validate FEAT status**:
   - `done` or `in-progress` → continue.
   - any other → stop and report.

4. **Load context**:
   - The FEAT and its `Implementation plan`.
   - Parent PRD, ADRs in `adrs:`, FEATs in `depends_on:`.
   - The implemented code: use `git log` or the FEAT's plan to map touched
     files.
   - Previous `Reviews` of the FEAT (read the REVs in `reviews:`).

5. **Identify the next free `REV-NNN`.**

## Workflow

### 1. Evaluation

Evaluate the FEAT against these axes. For each one, record concrete findings
with `file:line` when applicable:

| Axis                    | What to verify                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Acceptance criteria** | Each FEAT checkbox must be observable in code + test. List the uncovered ones.                                                                                                      |
| **PRD compliance**      | The PRD's goals and metrics are embodied in the implementation.                                                                                                                     |
| **ADR compliance**      | Each applicable ADR is respected. Detect silent deviations.                                                                                                                         |
| **Guidelines**          | CUPID, naming, patterns, absence of antipatterns listed in `guidelines.md`.                                                                                                         |
| **Tests**               | Reasonable coverage, absence of internal mocks, tests verify behavior not implementation.                                                                                           |
| **Performance**         | N+1 queries, unnecessary renders, excessive client bundling, lack of Suspense where applicable.                                                                                     |
| **Security**            | Unvalidated inputs at boundaries, secrets in code, SQL injection (rare with Drizzle but verify raw queries), XSS via `dangerouslySetInnerHTML`, lack of RLS/auth where appropriate. |
| **Structural smells**   | Long functions, premature abstractions, dead code, significant duplication.                                                                                                         |
| **Commit conventions**  | Conventional messages, correct scope, atomicity.                                                                                                                                    |

### 2. Findings classification

Each finding is classified:

- **blocker**: breaks acceptance criterion, violates ADR, security or data
  integrity risk.
- **major**: violates guidelines, measurable performance, structural smell with
  maintenance cost.
- **minor**: readability, specific coverage, missing comment where it adds
  value.
- **nit**: opinable, style, alternative naming.

### 3. REV generation

Create `.spec/reviews/REV-NNN-{slug}.md` with `status: ready` (REVs do not enter
draft; they are born ready to be acted on).

#### REV template

```markdown
---
id: REV-NNN
status: ready
version: 0.1.0
target: FEAT-NNN
iterations: []
verdict: pending
---

# Review of <feat name>

## Evaluated context

- PRD: [PRD-NNN slug](../prds/PRD-NNN-slug.md)
- ADRs: [ADR-NNN](../adrs/ADR-NNN-slug.md), ...
- Reviewed commits: <git range or hash>

## Executive summary

<3–5 lines: overall state, main concerns, closure recommendation.>

## Findings

### Blockers

1. **<Title>** — `path/file.ts:LN`
   - Problem: <…>
   - Impact: <…>
   - Expected action: <…>

### Majors

1. **<Title>** — `path/file.ts:LN`
   - Problem: <…>
   - Expected action: <…>

### Minors

1. **<Title>** — `path/file.ts:LN`

### Nits

1. **<Title>** — `path/file.ts:LN`

## Acceptance criteria compliance

| Criterion     | Status         | Note |
| ------------- | -------------- | ---- |
| <Criterion 1> | ✅ \| ⚠️ \| ❌ | <…>  |

## Iterations

### Iteration 1 — YYYY-MM-DD HH:MM UTC

_(Completed upon executing /code review mode)_

## Verdict

<approve | request-changes | reject — completed upon closing the cycle>

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                                   |
| ---------------- | ------- | ----------------------------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | Initial review: <synthesis of FEAT state and reason for preliminary verdict>. |
```

Update the FEAT: add `REV-NNN` to the `reviews:` array in the frontmatter, bump
its `version:` with **PATCH** (metadata change, not content), add changelog row
with the new version: _"Review started: [REV-NNN](../reviews/REV-NNN-slug.md)"_.

### 4. Remediation loop (maximum 3 iterations)

**Only enter the loop if there is at least one blocker or major.** If there are
only minors/nits, jump directly to closure with `verdict: approve` and the
minors as suggestions.

For each iteration (up to 3):

1. Invoke `/code` with the `REV-NNN` as context (`review` mode).
2. When `/code` returns the summary of resolved/rejected/pending findings:
   - Re-evaluate the code in the touched points.
   - Record the iteration in the `## Iterations` section of the REV:

     ```text
     ### Iteration N — YYYY-MM-DD HH:MM UTC
     Applied by /code review.
     - Resolved: <brief list>
     - Rejected: <brief list with justification>
     - Pending: <brief list>
     ```

   - **MINOR** bump of the REV (adds new content in Iterations section). Update
     `version:` and record changelog row citing the version.
   - If 0 blockers and 0 majors remain → exit the loop successfully.
   - If any remain, and we have not reached 3 → next iteration.
   - If we reach 3 without closing → exit and report.

3. Update `iterations:` in the frontmatter with `[1, 2, ...]`.

### 5. Closure

Determine the `verdict`:

- **approve** — 0 blockers, 0 majors. Minors/nits noted as future improvements.
- **request-changes** — blockers or majors remain after 3 iterations; requires
  human intervention or new PR.
- **reject** — the implementation strays so far from the FEAT that it is worth
  redoing.

Update:

- `REV-NNN.verdict`.
- `REV-NNN.status` to `done` and **promotion to `1.0.0`** (SemVer rule: first
  step to terminal state). If the REV was already at ≥ 1.0.0 (reopening), apply
  normal bump according to this session's change.
- REV's changelog with the new version: _"Closure after N iterations. Verdict:
  <…>. <main reason>"_.
- In the FEAT: **PATCH** bump (metadata change referencing the REV closure) and
  changelog row: _"[REV-NNN](../reviews/REV-NNN-slug.md) closed with verdict
  <…>"_.

If `verdict: approve` and the FEAT was in `done`, leave it in `done`. If a
different verdict, the FEAT returns to `in-progress` and is reported to the
user.

Report to the user in at most 8 lines: verdict, findings by severity, iterations
executed, next steps.

## Audit

Per the constitution (_Invoking helpers and /audit_). After Closure (§ 5):

- `target_paths`: REV path + targeted FEAT path.
- `caller_skill`: `/challenge`
- `caller_intent`: `closed REV-NNN with verdict <approve|request-changes|reject>`

## Invariant rules

- **Do not modify the FEAT, PRD or ADRs** during `/challenge` (except FEAT metadata:
  `reviews:`, PATCH bump and changelog row). For content changes in spec, open a
  change via `/spec`.
- **The REV is not modifiable** once closed (status `done`). If you reopen
  review, generate `REV-NNN+1`.
- **Findings with `file:line`** whenever possible. Without location, it is not
  an actionable finding.
- **Do not mix severities**: do not escalate nits to majors out of opinion.
  Severity is functional, not aesthetic.
- **Maximum 3 iterations**. If it does not close, escalate to human. More
  iterations = spec problem, not implementation.
- **SemVer**: REV is born at `0.1.0`; MINOR for each recorded iteration;
  promotion to `1.0.0` upon closing verdict.
- **If you find a bug outside the FEAT scope** that **does not affect** the
  criteria, note it in the REV as "out of scope, suggested for future FEAT" and
  do not act on it.
