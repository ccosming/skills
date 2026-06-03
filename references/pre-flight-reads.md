# Pre-flight reads

Read these foundation files before executing any workflow that writes to
`.spec/` or consumes existing artifacts.

| File                   | When                                                                |
| ---------------------- | ------------------------------------------------------------------- |
| `.spec/overview.md`    | Always. North star — mission, users, capabilities, outcomes, scope, constraints, context. |
| `.spec/guidelines.md`  | Always. Transversal engineering practices.                          |
| `.spec/personality.md` | Always. Agent persona the implementer embodies.                     |
| `.spec/stack.md`       | When the skill touches code, structure, devtools, or configs.        |
| `.spec/domain.md`      | If exists. Apply ubiquitous language; degrade gracefully when absent. |

## Missing mandatory file

If `overview.md`, `guidelines.md`, or `personality.md` is missing, stop and
direct the user to `/start`. If `stack.md` is missing and the skill needs
it, stop and direct the user to `/stack bootstrap`.

## Domain absence

`domain.md` is optional. When absent, do not abort — operate without
ubiquitous language enforcement.
