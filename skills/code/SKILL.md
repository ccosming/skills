---
name: code
description: >
  Implements the most available FEAT in `ready` whose dependencies are `done`.
  Loads FEAT + dependencies + ADRs + guidelines + personality and builds a plan
  in blocks with gates before coding. Supports "review" mode when invoked from
  /challenge to apply findings.
when_to_use: >
  User says "let's implement", "let's code FEAT-X", "let's program", or any
  equivalent that opens implementation work. Also invoked by /challenge to apply
  review findings.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
---

# Implementation

You operate as a senior engineer according to `.spec/personality.md`. Your job:
turn a `ready` FEAT into maintainable, tested code aligned with
`.spec/guidelines.md`.

## Modes

| Mode                  | When                      | Origin                                         |
| --------------------- | ------------------------- | ---------------------------------------------- |
| `implement` (default) | New FEAT to code          | Direct user invocation                         |
| `review`              | Apply findings from a REV | Invocation from `/challenge` with `REV-NNN` as input |

Detect the mode according to the received arguments. If you receive `REV-NNN`,
you are in `review`.

## Constitution

Operate under the constitution injected at session start. If it is not in context,
read `../../references/constitution.md` before proceeding.

Code language: identifiers and comments are written in **English by default**,
independent of `language.artifacts` and of the domain's coined term language.
`stack.md` (_Invariants_) may set a different code language; follow it when
present. This is a separate axis from the artifact language — a Spanish
`domain.md` does **not** make the code Spanish.

## Pre-flight (mandatory)

1. **Foundation** (charter, guidelines, personality) is injected at session
   start — do not re-read. Additionally read:
   - `.spec/stack.md` (if missing — e.g. a lean-track project that has not needed
     it yet — stop and route to `/spec`, which creates it before you resume)
   - `.spec/domain.md` (optional — if exists, use its **concepts** to name code,
     rendered in the code language above; do not transliterate a Spanish term into
     a Spanish identifier)

2. **In `implement` mode**:
   - List `.spec/feats/` and filter those with `status: ready`.
   - For each candidate, verify that its `depends_on:` are all in `done`.
   - If there are 0 valid candidates → report and stop.
   - If there is 1 → confirm it with the user.
   - If there are several → `AskUserQuestion` to choose, sort by fewest
     dependencies and creation order.

3. **In `review` mode**:
   - Read the received `REV-NNN`.
   - Read the FEAT referenced in `target:` of the REV.
   - Read only the code files mentioned in the findings.

4. **Load the context of the chosen FEAT**:
   - Parent PRD (reference in `prd:`).
   - All ADRs in `adrs:`.
   - All FEATs in `depends_on:` (to know contracts).

## Workflow — `implement` mode

### 1. Plan grilling

Conduct 1–3 rounds with `AskUserQuestion` **only** on real ambiguities. Cover,
if applicable:

- **Implementation decisions** with trade-off not covered by ADRs (if a weighty
  technical decision arises, **stop** and propose opening an ADR before
  continuing).
- **Scope assumptions**: confirm "out of scope" boundaries of the FEAT.
- **Test data**: how each acceptance criterion is validated.

Do not ask about aesthetic preferences or conventions already written in
`guidelines.md`.

### 2. Plan construction

Divide the implementation into **blocks** of visible progress. Each block
fulfills:

- Has **concrete scope** (which files, which public function).
- Ends in a **verifiable state**: tests pass, lint passes, types pass, app
  builds, or manual smoke test possible.
- Is **independently reviewable** (ideally a commit).

Block template:

```text
Block N — <title>
  Scope: <files/modules to touch>
  Output: <what works upon closing it>
  Gate: <command(s) that validate: pnpm test, pnpm typecheck, etc.>
  Owner: code | stack
```

Order: schema/types → pure logic → integration → UI → integration tests → docs.

**Block ownership**: mark `Owner: stack` for any block whose scope touches
stack-managed surface (see `workflow.md` → _Procedural orchestration → Stack_):
`package.json`, `tsconfig.json`, monorepo configs, lockfiles, CI workflows,
devtools configs, top-level folder skeleton. All other blocks are `Owner: code`.
Stack-owned blocks are **delegated** to `/spec` (stack mode) during execution; do
not implement them directly.

### 3. Gate cadence choice

`AskUserQuestion`:

- **Gate per block** (Recommended if the FEAT touches DB, public contracts or
  external integration) — the agent stops after each block and waits for human
  review.
- **Gate at the end** — the agent executes all blocks in sequence and requests
  review upon closing.

### 4. Plan registration in the FEAT

Insert the plan in the `## Implementation plan` section of the FEAT (above
`## Changelog`). Format:

```markdown
## Implementation plan

_Generated: YYYY-MM-DD HH:MM UTC · Cadence: gate per block \| final gate_

### Block 1 — <title>

- Scope: <…>
- Output: <…>
- Gate: <commands>

### Block 2 — <title>

...
```

Change the FEAT's `status` to `in-progress`. Bump SemVer **MINOR** (adding
Implementation plan is a compatible addition to the FEAT). Update changelog with
a row citing the new version: _"Implementation start: cadence <X>, N blocks
planned"_.

### 5. Execution

For each block:

1. **If `Owner: stack`** → invoke `/spec` via `Task` (stack delegated mode — see
   `workflow.md` → _Procedural orchestration → Stack_), passing the block spec
   (title, scope, output, gate, originating `FEAT-NNN`). Wait for its structured
   summary. Skip the steps below for this block; continue to the next.
2. Implement following `guidelines.md` and `personality.md`.
3. Write tests where the guidelines indicate (pure logic → TDD; UI → optional).
4. Execute the block gate (`pnpm test`, `pnpm typecheck`, `pnpm lint`).
5. If the gate fails, **fix before continuing**. Never accumulate debt between
   blocks.
6. If the cadence is "per block", report status to the user and wait. If it is
   "final", continue.
7. Commit the block **through the commit skill** —
   `Skill(skill="commit", args="suggested_scope: FEAT-NNN; subject: <block>")`. It
   inspects the diff, runs the secrets check, drafts the Conventional Commit
   (`feat(FEAT-NNN): <block>` or the right type), and commits **only after the
   user's explicit approval**. Never run `git add`/`git commit` yourself.

### 6. Closure

1. Verify that **all acceptance criteria** of the FEAT are covered.
2. Execute the full gate: tests, typecheck, lint, build.
3. Change FEAT's `status` to `done`.
4. **Promotion to `1.0.0`** (global SemVer rule: first step to terminal state).
   If the FEAT was already at ≥ 1.0.0 due to previous iterations, apply normal
   bump according to the dominant change of this session.
5. Update `version:` and add a row to the changelog citing the new version:
   _"Implementation completed.
   <Brief summary of what was built and specific decisions not documented in ADR>"_.
   Commit these closure edits through the commit skill
   (`Skill(skill="commit", args="suggested_scope: FEAT-NNN; subject: close")`).
6. Report to the user: completed blocks and commands to verify locally. Then
   offer to challenge the implementation; on yes, invoke
   `Skill(skill="challenge")`. The build⇄review loop runs inside `/code`.

## Workflow — `review` mode

### 1. REV reading

Read `REV-NNN-{slug}.md` and group the findings:

- **blocker**: breaks acceptance criteria, security, data integrity.
- **major**: violates guidelines, significant performance, structural smell.
- **minor**: readability, naming, specific coverage.
- **nit**: style, opinable.

### 2. Remediation plan

Do not re-plan the entire FEAT. Create a focused mini-plan:

```text
Iteration X (review mode from REV-NNN):
  - <Finding> → <file:line> → <action>
  ...
```

Address **blockers and majors always**. Address minors if they are cheap.
Document the nits that are **not** addressed with justification.

### 3. Application

For each addressed finding:

1. Edit the code.
2. Run the relevant gate (test/lint/types).
3. Confirm that the finding is resolved.

### 4. Iteration closure

1. **SemVer bump** of the FEAT according to the dominant change of the
   iteration:
   - **MAJOR** if the iteration changes the code contract (public API, DB
     schema, reinterpreted acceptance criterion).
   - **MINOR** if it adds coverage, cases, structural refactor without breaking
     contract.
   - **PATCH** if it only fixes quality (naming, specific performance, smell).
2. Update the FEAT's changelog with a row citing the new version: _"Review
   iteration applied via [REV-NNN](../reviews/REV-NNN-slug.md):
   <resolved findings>, <rejected findings with reason>"_.
3. Keeps `status: done` if blockers/majors were resolved; drops to `in-progress`
   if any remained pending and `/challenge` will decide whether to iterate again.
   The version never goes backward even if the status drops.
4. Return control to `/challenge` with a structured summary:

   ```text
   Resolved: N (blockers: N, majors: N, minors: N)
   Rejected: N
   Pending: N
   ```

## Audit

Per the constitution (_Invoking helpers and /audit_). After Closure of either
`implement` mode (§ 6) or `review` mode (§ 4):

- `target_paths`: FEAT path plus any other `.spec/` paths modified.
- `caller_skill`: `/code`
- `caller_intent`: one-line, e.g. `implemented FEAT-NNN` or
  `applied REV-NNN iteration N`.

## Invariant rules

- **Do not start coding without a visible plan** and `in-progress` status in the
  FEAT.
- **Do not skip the gate** of a block for speed.
- **Do not modify `.spec/` files** during `/code`. If you detect inconsistency,
  **stop** and suggest a change via `/spec`. The only permitted exception over the
  FEAT are:
  adding Implementation plan, updating status, version bump and changelog row.
- **Do not modify stack-managed files** (see `workflow.md` → _Procedural
  orchestration → Stack_). Delegate any block that touches them to `/spec` via
  `Task` (stack mode). `/code` writes product code only.
- **Do not mix features**: a `/code` touches one FEAT. If the need to touch
  another arises, stop and report.
- **Never commit by hand.** Every commit — per block (§ 5.7) and the closure
  edits (§ 6) — goes through `Skill(skill="commit")`, which runs the secrets
  check and requires explicit user approval. `/code` never runs `git add` or
  `git commit` itself, and never bypasses the approval gate.
- **Do not touch tests without touching code** (except new coverage) nor vice
  versa.
- **SemVer**: MINOR when starting implementation (adds Implementation plan);
  promotion to `1.0.0` when closing `done` for the first time; bump according to
  the nature of the change in review iterations.
- **If you lose context** (gate fails repeatedly without a clear reason), stop
  and report before continuing.
