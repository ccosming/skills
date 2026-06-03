# SemVer

Every `.spec/` artifact carries `version: X.Y.Z` in frontmatter.

## Lifecycle

| Event                                                   | Version action               |
| ------------------------------------------------------- | ---------------------------- |
| Created                                                 | Born at `0.1.0`              |
| First transition to terminal state (`done` or `locked`) | Promote to `1.0.0`           |
| Subsequent terminal-state transitions                   | Bump per change nature       |

Version never decreases, even if status drops back from `done` to `ready`.

## Bump rules

| Bump   | When                                                                            |
| ------ | ------------------------------------------------------------------------------- |
| MAJOR  | Contract break — criterion removed/redefined, ADR replaced, scope inverted.     |
| MINOR  | Compatible addition — new section, new criterion, new linked artifact.          |
| PATCH  | Clarification, wording, metadata refresh.                                       |

## Cascading

The same change can produce different bump types in different artifacts.
Each artifact is versioned independently per its own impact (e.g., a PR can
cause MAJOR in a FEAT and MINOR in its parent PRD in the same session).

## Promotion vs bump

Promotion to `1.0.0` is automatic on the first terminal transition and
replaces the normal bump for that step. Subsequent transitions follow the
bump table above.
