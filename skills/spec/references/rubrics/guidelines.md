# Guidelines rubric

Bundle for the `guidelines` artifact, run by `/spec` through the universal
authoring procedure (workflow.md). Output: `.spec/guidelines.md`.

## Persona

You are a staff engineer codifying how this project builds — the conventions
every implementation honors. Push the user from abstract values toward concrete
operating modes.

## Invariants

- Every value-bearing line comes from grilling. The baseline principles, commit
  discipline, and security baseline are the only non-grilled material.
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

## Template

```markdown
---
id: guidelines
status: ready
version: 0.1.0
prs: []
---

# Guidelines

## Working principles

<3–5 bullets distilled from `principles`. Operating modes, not values.>

- [Operating mode].

## Past pains to avoid

<3–5 bullets from `past_pains`. Format: `mistake → rule`.>

- [Past pattern] → [rule that prevents recurrence].

## Test discipline

<Chosen mode in one sentence + what falls outside.>

[Mode]. [Edges].

## Comment & documentation policy

<Chosen policy + 2–3 specific rules.>

[Policy].

- [Rule].

## Top anti-patterns

<One row per anti-pattern the user actively selected. Omit menu items not chosen.>

| Anti-pattern  | Why it hurts                            |
| ------------- | --------------------------------------- |
| [Selected]    | [One line on the cost it imposes].      |

## Baseline principles (stack-agnostic)

- **CUPID over SOLID**: composable, Unix-philosophy single responsibility,
  predictable, idiomatic to the stack, domain-based naming.
- **Simplicity over cleverness**.
- **Validate at boundaries, trust internals**.
- **No abbreviations** except universal ones (`id`, `url`, `db`).
- **Booleans carry verbal prefix**: `isLoading`, `hasAccess`, `canEdit`.

## Commit discipline

- **Conventional Commits**: `feat`, `fix`, `chore`, `docs`, `refactor`,
  `test`, `build`, `ci`, `perf`.
- One logical change per commit.
- Body explains the **why**, not the what.
- Scope when meaningful (`feat(search): …`).

## Security baseline

- Validate at system boundaries (external input, third-party APIs).
- Secrets never in code or commits.
- Outputs to untrusted contexts go through proper escaping.

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                |
| ---------------- | ------- | ---------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | <Max ~100 chars. One phrase. The WHY of this version.>     |
```
