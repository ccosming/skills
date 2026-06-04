---
name: pr
description: >
  Change request over an existing PRD not in `in-progress`. Critical grilling,
  cascade impact analysis across ADRs, FEATs and orthogonal files, and locked PR
  on closure.
when_to_use: >
  User says "let's modify PRD-X", "let's change feature Y", "let's review this
  decision" over something already defined. NOT for new capabilities (use /prd)
  or for PRDs in active implementation.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
user-invocable: false
---

# Change request

You operate as a critical reviewer with a bias to defend system coherence. You
are not complacent: you question the motivation for the change, its cost and its
technical justification.

## Constitution

Operate under the constitution injected at session start — voice, localization,
`AskUserQuestion`, helper and `/audit` invocation, and the `.spec/` artifact
model (SemVer, status flow, changelog, cross-references). If it is not in
context, read `../../references/constitution.md` before proceeding.

## Pre-flight

1. Foundation is injected at session start — do not re-read `overview.md`. Read
   `.spec/domain.md` if it exists (use ubiquitous language when editing
   artifacts).
2. Ask the user for the target PRD (or the root ADR/FEAT if the change
   originates there). Confirm the file's `status`:
   - If `in-progress` → **stop**. Suggest completing the implementation or
     cancelling first.
   - If `locked` → **stop**. PRs are immutable.
   - If `draft` or `ready` or `done` → continue.
3. Load the target PRD and all referenced files (ADRs, FEATs, and previous
   `prs:` of the file).
4. Identify the next free `PR-NNN`.

## Workflow

### 1. Critical grilling

Conduct 2–3 rounds with `AskUserQuestion` covering:

- **What exactly changes**. Force specificity (section, criterion, decision).
- **Why now**. New learning, user feedback, technical constraint, original
  error.
- **Assumed cost**. Re-work of `done` FEATs, invalidation of current ADRs,
  contract breakage.
- **Discarded alternatives**. If there is only one option, suspicious.

If the justification is weak ("looks better", "I like it more"), **return it**
with a direct response: the change is not applied.

### 2. Cascade impact analysis

Build the impact graph by reading:

- The target PRD.
- ADRs in the PRD's `adrs:`.
- FEATs in the PRD's `feats:`.
- For each FEAT, its `adrs:` and `depends_on:` (second level).
- If it affects conventions, the orthogonals (`overview.md`, `guidelines.md`,
  `personality.md`).

For each node in the graph, evaluate concretely:

| Question                                    | Action if "yes"                         |
| ------------------------------------------- | --------------------------------------- |
| Does it change section X of this file?      | Mark for editing                        |
| Does it invalidate an acceptance criterion? | Mark and record replacement             |
| Does it obsolete a technical decision?      | Mark ADR for deprecation or replacement |
| Does it break a dependency between FEATs?   | Recompute order and mark affected FEATs |

### 3. Change listing

Present to the user a **concise and direct** summary, fixed format:

```text
Proposed changes:

PRD-001 search-engine
  - Rewrite "Success metrics" section
  - Add acceptance criterion 4

ADR-003 ranking-algo
  - Mark deprecated; replaced by new ADR
ADR-NEW vector-ranking
  - Create: hybrid BM25 + embeddings ranking

FEAT-005 indexer-pipeline
  - Update activity diagram
  - Remove criterion 2

guidelines.md
  - Add rule about local-first embeddings

Files to touch: 5 · New: 1 · Status during change: draft
```

### 4. Explicit confirmation

Use `AskUserQuestion` with options:

- **Apply all listed changes** (Recommended if the analysis is solid).
- **Apply a subset** (then re-ask which ones).
- **Cancel** (nothing is written, no PR is created).

**Do not proceed without explicit response.**

### 5. Application

For each affected file:

1. Change `status` to `draft`.
2. Apply the agreed edits.
3. Add `PR-NNN` to the `prs: []` array in the frontmatter (without duplicating).
4. **SemVer bump** according to the nature of the applied change:
   - **MAJOR** if the change breaks the file's contract (criterion
     removed/redefined, ADR replaced, scope inverted).
   - **MINOR** if the change adds compatible content (new criterion, FEAT
     linked, section added).
   - **PATCH** if it is only wording/clarification.
   - If the file was at `0.x.y` and this change makes it cross to terminal state
     later, the bump to `1.0.0` will be done by the corresponding skill (`/code`
     or the closure of `/pr` itself for new PRs), not here.
5. Update `version:` in the frontmatter to the new value.
6. Add a row to `## Changelog`: UTC timestamp + `Version` column with the new
   value + description of the **why** of the change, citing `PR-NNN`. E.g.
   _"Applied [PR-NNN](../prs/PR-NNN-slug.md): metrics are redefined because the
   original baseline was unreachable with current data"_.

If a file is newly created (derived ADR/FEAT), its frontmatter includes
`prs: [PR-NNN]` from the start and `version: 0.1.0`.

### 6. Status restoration

Once the changes are applied, return each file to an appropriate status:

- If it was in `ready`/`done` and the criteria remain valid → `ready`.
- If it was in `done` but now requires re-implementation → `ready` (returns to
  the `/code` queue).
- If the change left the file half-defined → `draft` and notify the user.

### 7. PR creation

Create `.spec/prs/PR-NNN-{slug}.md` using the template. Final status: `locked`.

#### PR template

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
  orthogonal: [overview, guidelines, personality]
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

| Timestamp (UTC)  | Version | Description                                                                                             |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 1.0.0   | PR creation and closure (born and remains locked in the same session). <Synthesis of motive and scope>. |
```

## Audit

Per the constitution (_Invoking helpers and /audit_). After PR creation (§ 7):

- `target_paths`: new PR path + every cascaded file path.
- `caller_skill`: `/pr`
- `caller_intent`: `applied PR-NNN with cascade across <N> files`

## Invariant rules

- **Status during the process**: any file under active analysis moves to `draft`
  as soon as it is decided to intervene on it. It is restored at the end.
- **PRs are immutable**. Once `locked`, they are only referenced. The PR is born
  and closed in the same session with `version: 1.0.0`.
- **Never change an ADR in `locked`**. Create a new one that replaces it and
  mark the old one as `deprecated` in its status.
- **Each touched file** must end with `PR-NNN` in its `prs:` array, a new row in
  its changelog with the resulting version, and `version:` bumped according to
  the global SemVer rule.
- **Cascading SemVer**: each file affected by the PR is versioned independently
  according to its impact. The same PR can generate MAJOR in a FEAT and MINOR in
  its parent PRD.
- If the analysis reveals that the change is trivial (typo, wording), **stop**
  and suggest editing directly without PR.
- If the analysis reveals that the change is huge (rethinks the capability),
  **stop** and suggest creating a new PRD via `/prd` and deprecating the current
  one.
