---
name: audit
description: >
  Validates the integrity of `.spec/` artifacts against the plugin's invariants
  — frontmatter, status, SemVer, cross-references, transitions, changelog,
  file-naming, orphans, and domain consistency. Returns a structured YAML
  findings report. Read-only.
when_to_use: >
  Invoked by other skills (/charter, /guidelines, /personality, /stack, /prd,
  /code, /challenge, /pr, /domain) at the closure of any workflow that creates or
  modifies `.spec/` files. Not user-invocable.
allowed-tools: Read, Glob, Grep, Bash
user-invocable: false
context: fork
---

# System integrity check

You operate as a system watchdog. Your job: read `.spec/` artifacts and verify
that they comply with the plugin's invariants. You **do not modify files** — you
report. The caller decides what to do with the findings.

## Invocation

Invoked from other skills, never directly by the user. With `context: fork`,
invoking it runs an isolated subagent that returns its YAML report to the caller
(per the constitution, _Invoking helpers and /audit_). Expected callers:
`/charter`, `/guidelines`, `/personality`, `/stack`, `/prd`, `/code`,
`/challenge`, `/pr`, `/domain`.

Standard caller pattern:

```text
Skill(skill="audit", args="target_paths: <paths>; caller_skill: <name>; caller_intent: <one-line description>")
```

## Input

Args parsed as semicolon-separated `key: value` pairs:

- **`target_paths`** _(optional)_: comma-separated paths to focus on. If empty,
  audits all `.spec/**/*.md` plus `.spec/*.md`.
- **`caller_skill`** _(required)_: name of the invoking skill (e.g., `/prd`).
- **`caller_intent`** _(required)_: one-line description of what just happened
  (e.g., "created PRD-007 with 2 ADRs and 3 FEATs").

## Workflow

### 1. Determine scope

If `target_paths` is provided:

1. Load each listed file.
2. Resolve their first-degree references (e.g., a PRD pulls in its `adrs:` and
   `feats:`; a FEAT pulls in its `prd:`, `adrs:`, `depends_on:`).
3. Audit only these — focused mode.

Else:

1. `Glob` `.spec/**/*.md` plus `.spec/*.md`, excluding `.spec/usage.md` (a
   generated metrics ledger, not a versioned artifact — like `config.yaml`).
2. Audit all — comprehensive mode.

### 2. Run checks

For each loaded file, apply the rule set below. Tag every finding with:
`severity`, `rule_id`, `file`, `message`, and (when known) a `suggestion`.

Severities:

- **`error`**: violates a hard invariant. Consumers (other skills) may break on
  this artifact.
- **`warning`**: system smell. Not a hard break but indicates rot or sloppy
  state.
- **`info`**: notable observation that may need attention later.

### 3. Return YAML report

Emit **only** this YAML block (the caller parses it):

```yaml
status: clean | issues_found | error
summary:
  files_audited: <N>
  errors: <N>
  warnings: <N>
  info: <N>
findings:
  - severity: error | warning | info
    rule: <rule_id>
    file: <path>
    message: <one sentence>
    suggestion: <optional one-line hint>
caller_note: <optional one-line summary for the caller>
```

- `status: clean` → no findings of any severity.
- `status: issues_found` → at least one warning or error.
- `status: error` → /audit itself failed (e.g., couldn't parse frontmatter on a
  critical file).

## Rules

### Frontmatter (R0xx)

| ID   | Severity | Check                                                                                     |
| ---- | -------- | ----------------------------------------------------------------------------------------- |
| R001 | error    | File has valid YAML frontmatter (enclosed by `---` lines).                                |
| R002 | error    | Required fields present per artifact type (see README → Conventions → Frontmatter shape). |
| R003 | error    | `status` value ∈ {`draft`, `ready`, `in-progress`, `done`, `locked`, `deprecated`}.       |
| R004 | error    | `version` matches `\d+\.\d+\.\d+`.                                                        |
| R005 | error    | `id` matches expected pattern per type (e.g., `PRD-NNN`, `ADR-NNN`).                      |
| R006 | warning  | Frontmatter contains no extraneous unknown fields.                                        |

### Cross-references (R1xx)

| ID   | Severity | Check                                                                                |
| ---- | -------- | ------------------------------------------------------------------------------------ |
| R101 | error    | PRD's `adrs:` and `feats:` arrays only reference existing artifacts.                 |
| R102 | error    | FEAT's `prd:`, `adrs:`, `depends_on:`, `reviews:` only reference existing artifacts. |
| R103 | error    | ADR's `prds:` and `feats:` only reference existing artifacts.                        |
| R104 | error    | REV's `target:` (FEAT) exists.                                                       |
| R105 | error    | PR's `target:` and `affects:` lists only reference existing artifacts.               |
| R106 | error    | Stack's `adrs:` only reference existing artifacts.                                   |
| R107 | warning  | Bi-directional consistency: if A lists B in its array, B should mention A back.      |

### Status and transitions (R2xx)

| ID   | Severity | Check                                                                                   |
| ---- | -------- | --------------------------------------------------------------------------------------- |
| R201 | error    | PR's status is `locked` once created (PRs never re-enter draft).                        |
| R202 | warning  | FEAT in `done` has a populated `## Implementation plan` section.                        |
| R203 | warning  | REV in `done` has `verdict` ∈ {`approve`, `request-changes`, `reject`} (not `pending`). |
| R204 | warning  | Stack's `sync_status: drifted` → repo and stack.md disagree; needs `/stack` sync-check. |

### Changelog (R3xx)

| ID   | Severity | Check                                                                                 |
| ---- | -------- | ------------------------------------------------------------------------------------- |
| R301 | error    | Artifact has a `## Changelog` section (except GRILL during the loop).                 |
| R302 | error    | Each changelog row has `Timestamp (UTC)`, `Version`, `Description` columns populated. |
| R303 | error    | The latest changelog row's `Version` matches the frontmatter `version:` field.        |
| R304 | warning  | Changelog rows are in chronological order (oldest first, newest last).                |
| R305 | warning  | Each row's Description starts with a verb or cites the **why** of the change.         |

### File naming (R4xx)

| ID   | Severity | Check                                                                         |
| ---- | -------- | ----------------------------------------------------------------------------- |
| R401 | error    | Filename matches `{TYPE}-NNN-{slug}.md` for numbered artifacts.               |
| R402 | error    | `id` field matches `{TYPE}-NNN` from the filename.                            |
| R403 | error    | Slug uses kebab-case (lowercase, hyphens only).                               |
| R404 | error    | Singleton artifacts live at the documented paths (`.spec/charter.md`, etc.). |

### Orphans and staleness (R5xx)

| ID   | Severity | Check                                              |
| ---- | -------- | -------------------------------------------------- |
| R501 | warning  | ADR not referenced by any PRD, FEAT, or stack.md.  |
| R502 | error    | FEAT without a `prd:` parent that exists.          |
| R503 | warning  | REV in non-terminal status not touched in >7 days. |
| R504 | info     | Stack's `last_verified:` older than 30 days.       |

### Domain consistency (R6xx)

**Only applied when `.spec/domain.md` exists.** If absent, skip the entire R6xx
group.

| ID   | Severity | Check                                                                                                         |
| ---- | -------- | ------------------------------------------------------------------------------------------------------------- |
| R601 | warning  | Term used in an artifact (capitalized phrase or frequent noun) is not in `domain.md` `## Terms`.              |
| R602 | warning  | Term appears in multiple bounded contexts without being declared as External (from) in the consuming context. |
| R603 | info     | Term defined in `domain.md` but not referenced by any artifact (orphan term — candidate for removal).         |

## Examples

### Clean report

```yaml
status: clean
summary:
  files_audited: 12
  errors: 0
  warnings: 0
  info: 0
findings: []
caller_note: All 12 artifacts pass invariants after /prd Phase 5.
```

### Issues found

```yaml
status: issues_found
summary:
  files_audited: 14
  errors: 1
  warnings: 2
  info: 0
findings:
  - severity: error
    rule: R102
    file: .spec/feats/FEAT-013-indexer-pipeline.md
    message: FEAT references ADR-009 in `adrs:` but ADR-009 does not exist.
    suggestion: Either create ADR-009 or remove the reference from FEAT-013.
  - severity: warning
    rule: R204
    file: .spec/stack.md
    message: sync_status is `drifted`; repo state diverges from declared stack.
    suggestion:
      Run /stack in sync-check mode and resolve before /code execution.
  - severity: warning
    rule: R501
    file: .spec/adrs/ADR-003-supply-chain.md
    message: ADR-003 is not referenced by any PRD, FEAT, or stack.md.
    suggestion: Link it from at least one consumer, or mark as deprecated.
caller_note: 1 broken reference blocks /code; 2 warnings non-blocking.
```

## Caller obligations

When a caller receives the report:

- **`status: clean`** → proceed, optionally print a 1-line confirmation.
- **`status: issues_found` with errors** → report findings to the user, do
  **not** claim workflow success. User decides next steps (fix now, defer,
  accept).
- **`status: issues_found` with only warnings/info** → report findings to the
  user as a non-blocking note; proceed with closure.
- **`status: error`** → /audit itself failed; surface and stop.

## Invariant rules

- **Read-only**. /audit never writes or modifies files. Reports only.
- **Deterministic**. Same input set → same output. No grilling, no
  AskUserQuestion.
- **No side effects**. Does not run `pnpm install` or any repo command beyond
  `find` / `grep` / `cat` for parsing.
- **Bounded scope**. If `target_paths` provided, do **not** expand audit to the
  full `.spec/` tree unless explicitly comprehensive mode.
- **Single output**. Return the YAML report block only — no prose preamble, no
  trailing commentary. The caller's `Task` will pass it through.
