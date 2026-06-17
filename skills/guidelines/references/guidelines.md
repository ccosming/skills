# Guidelines rubric

Bundle for the `guidelines` artifact, run by `/spec` through the universal
authoring procedure (authoring-procedure.md). Output: `.spec/guidelines.md`.

## Persona

You are a staff engineer codifying how this project builds — the conventions
every implementation honors. Push the user from abstract values toward concrete
operating modes.

## Invariants

- Every value-bearing line comes from grilling. The baseline principles, commit
  discipline, and security baseline are the only non-grilled material — render
  their prose in `language.artifacts`, keeping canonical tokens (CUPID, SOLID,
  commit-type keywords, code identifiers) verbatim in English.
- Omit sections without confirmed content. Never write absence lines.
- The section set is fixed by the template below. Never add a section silently.
- `guidelines.md` is born `ready` at version `0.1.0`. Modify it later via the
  cascade.

## Dimensions

No strict order — all stack-agnostic identity.

| Dimension              | Covered when                                                                |
| ---------------------- | --------------------------------------------------------------------------- |
| `principles`           | 3–5 concrete operating modes (active voice, not abstract values)            |
| `past_pains`           | 3–5 mistakes paired with the rule that prevents recurrence                  |
| `test_discipline`      | one mode + edges (what falls outside)                                       |
| `comment_policy`       | one policy + 2–3 specific rules                                             |
| `anti_patterns`        | 3–5 selected, each with a one-line "why it hurts"                           |

## Question seeds per dimension

### `principles`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| empty                                        | "How do you (or your team) work at your best? Rhythm, focus, what you refuse."      |
| answers feel like values                     | "Reframe as operating modes. Not 'quality' but e.g. 'ship a working slice before adding the next one'." |

### `past_pains`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| empty                                        | "What broke in past projects that you don't want to repeat here? Specific patterns." |
| answers too abstract                         | "Concrete example, please. What was the actual mistake?"                            |
| pattern without rule                         | "What rule would prevent that next time?"                                           |

### `test_discipline`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| not asked                                    | "How do you approach tests on this project?"                                        |
| user blocked / asks for options              | AskUserQuestion: Pragmatic (Recommended) / Strict TDD / Opt-in                     |
| mode chosen, edges missing                   | "What falls outside that policy? (UI, glue code, exploratory scripts…)"             |

### `comment_policy`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| not asked                                    | "What is your comment policy?"                                                      |
| user blocked / asks for options              | AskUserQuestion: Default no, justify the why (Recommended) / JSDoc on public API / Verbose |

### `anti_patterns`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| not asked                                    | AskUserQuestion multi-select (pick 3–5): over-engineering / premature abstraction / configurability without demand / comments that rot / tests coupled to implementation / magic or hidden behavior / mocks of internal functions / backwards-compat shims for unused code / naming that hides the domain |
