# Artifact model

Full mechanics for the `.spec/` artifact model and Markdown conventions. The
constitution holds the summary and the binding rules; this file holds the
detail (SemVer, status flow, changelog, cross-references, formatting).

## The .spec artifact model

Every artifact under `.spec/` carries frontmatter with at least `id`, `status`,
and `version` — **no `title:`** (the human title is the body `# H1`). It ends
with a `## Changelog` section; when user interventions shaped it, an
`## Interaction notes` section sits just above the Changelog.

`.spec/config.yaml` (languages) and `.spec/usage.md` (the generated cost ledger)
are **not** artifacts: they carry no frontmatter and `/audit` skips them.

### SemVer

| Event | Version action |
| --- | --- |
| Created | Born at `0.1.0` |
| First transition to terminal state (`done` or `locked`) | Promote to `1.0.0` |
| Subsequent terminal-state transitions | Bump per change nature |

| Bump | When |
| --- | --- |
| MAJOR | Contract break — criterion removed/redefined, ADR replaced, scope inverted. |
| MINOR | Compatible addition — new section, new criterion, new linked artifact. |
| PATCH | Clarification, wording, metadata refresh. |

Version never decreases, even if status drops from `done` back to `ready`.
Promotion to `1.0.0` replaces the normal bump on the first terminal transition.
The same change can produce different bumps in different artifacts (cascading);
version each artifact independently per its own impact.

### Status flow

| Status | Meaning |
| --- | --- |
| `draft` | Under construction; not ready for the next consumer. |
| `ready` | Complete and ready for the next consumer. |
| `in-progress` | A skill picked it up (e.g., `/code` on a FEAT). |
| `done` | Terminal success. |
| `locked` | Terminal immutable. PR artifacts only. |
| `deprecated` | Superseded by a newer artifact; kept for history. |

| From | To |
| --- | --- |
| `draft` | `ready`, `deprecated` |
| `ready` | `in-progress`, `deprecated` |
| `in-progress` | `done`, `locked`, `ready` (revert) |
| `done` | `ready` (re-implementation), `deprecated` |
| `locked` | `deprecated` only (if superseded) |
| `deprecated` | (terminal) |

PR artifacts skip `draft`/`ready` — they are born `locked`. `/pr` is the only
skill that locks an artifact. `deprecated` artifacts stay in the repo for
history; never delete them. Reverting `done` → `ready` requires a changelog
justification (typically a `/pr` cascade).

### Changelog

Every version bump produces one new row. Group related changes from one session
under a single timestamp.

````markdown
| Timestamp (UTC)  | Version | Description                                           |
| ---------------- | ------- | ----------------------------------------------------- |
| YYYY-MM-DD HH:MM | X.Y.Z   | <≤100 chars. One phrase. The WHY of this change.>     |
````

- ≤100 chars per row; split into multiple rows if longer.
- State the **WHY**, not the **what** — the diff shows the what.
- Active voice. Cite related artifacts inline:
  _"Applied [PR-007](../prs/PR-007-slug.md): cap raised, baseline unreachable."_
- Rows ordered oldest first, newest last.
- The `Version` column of the newest row must equal the frontmatter `version:`.

### Cross-references

Link artifacts with markdown links and frontmatter arrays. The path is relative
from `.spec/<type>s/` to the linked artifact's folder:

````markdown
[ID slug](../{type}s/ID-slug.md)
````

Examples: `[PRD-007 search-engine](../prds/PRD-007-search-engine.md)`,
`[ADR-003 ranking-algo](../adrs/ADR-003-ranking-algo.md)`.

| Field | Used by | Contents |
| --- | --- | --- |
| `prs` | All artifacts | PRs that touched this artifact |
| `adrs` | PRD, FEAT, stack, arch | ADRs that constrain this artifact |
| `feats` | PRD, ADR | FEATs derived from this PRD/ADR |
| `prds` | ADR | PRDs this ADR serves |
| `prd` | FEAT | Parent PRD |
| `depends_on` | FEAT | FEATs that must be `done` before starting |
| `reviews` | FEAT | REVs that audited this FEAT |
| `target` | REV, PR | The single FEAT (REV) or PRD (PR) targeted |
| `affects` | PR | All artifacts touched by the PR cascade |

If artifact A lists B in its array, B lists A back (or is A's declared target).
One-sided references are flagged by `/audit`.

## Markdown conventions

- One `# H1` per artifact: the human title, **without** the artifact code
  (`ADR-001`, `FEAT-003`). The code lives in `id` and the filename.
- Section headers stay English; their content follows `language.artifacts`.
- Diagrams use the minimalist Mermaid style from the catalog — a grayscale `base`
  palette (the catalog's init block) with mid-gray edges, never per-diagram colors,
  and a layout chosen for legibility (direction, grouping, short labels).
- Line wrapping, table-column alignment, and blank-line spacing are normalized
  automatically: the plugin reformats every `.spec/` Markdown file after each
  write. Write valid Markdown and let the formatter normalize it — never hand-pad
  table cells or count columns.

### Interaction notes

The `## Interaction notes` section records user interventions that **changed the
skill's stance** or surfaced a project-relevant point the grilling missed — not
routine answers. Each entry is one line in `language.artifacts`: what the user
corrected or emphasized, and how it shifted the artifact. Omit the section when
no such intervention occurred (no "none" line).
