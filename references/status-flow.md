# Status flow

## Taxonomy

| Status        | Meaning                                                            |
| ------------- | ------------------------------------------------------------------ |
| `draft`       | Under construction; not yet ready for the next consumer.           |
| `ready`       | Complete and ready for the next consumer.                          |
| `in-progress` | A skill picked it up (e.g., `/code` on a FEAT, `/rev` on a review).|
| `done`        | Terminal success.                                                  |
| `locked`      | Terminal immutable. PR artifacts only.                             |
| `deprecated`  | Superseded by a newer artifact; kept for history.                  |

## Valid transitions

| From          | To                                          |
| ------------- | ------------------------------------------- |
| `draft`       | `ready`, `deprecated`                       |
| `ready`       | `in-progress`, `deprecated`                 |
| `in-progress` | `done`, `locked`, `ready` (revert)          |
| `done`        | `ready` (re-implementation), `deprecated`   |
| `locked`      | `deprecated` only (if superseded)           |
| `deprecated`  | (terminal)                                  |

## Constraints

- PR artifacts skip `draft`/`ready` — they are born `locked`.
- `/pr` is the only skill that locks an artifact.
- `deprecated` artifacts stay in the repo for history. They are never
  deleted.
- Reverting from `done` to `ready` requires a justification in the
  changelog row (typically a `/pr` cascade).
