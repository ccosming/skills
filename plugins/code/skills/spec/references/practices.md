# Practices

Reference for the `code` plugin's spec interview. Encodes the user's default working practices: testing strategy, Definition of Done, branching, release, and code conventions. The skill consults this file when proposing values for the `practices` section of `spec.yaml`.

## Testing strategy

| Level       | When to apply                                                                       |
| ----------- | ----------------------------------------------------------------------------------- |
| Unit        | pure functions in lib/ utility code, logic expensive to set up otherwise            |
| Integration | preferred when both unit and integration are possible (more realistic, fewer mocks) |
| E2E         | critical user flows only, not for every page/feature                                |

## Definition of Done (default checklist)

| Step                     | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| Format                   | prettier passes                                                      |
| Lint                     | eslint / ruff passes                                                 |
| Typecheck                | tsc / pyright / cargo check passes                                   |
| Unit + integration tests | all pass                                                             |
| E2E (when applies)       | critical flows pass                                                  |
| Smoke check              | manually exercise the feature in a browser/CLI before reporting done |

## Branching model

| Model       | When to apply                                                      |
| ----------- | ------------------------------------------------------------------ |
| trunk       | default; solo or small team, fast iteration                        |
| github-flow | external contributions or larger team needing PR review per change |

## Release strategy

| Item            | Convention                                                         |
| --------------- | ------------------------------------------------------------------ |
| Commit messages | conventional commits (feat, fix, chore, docs, refactor, test, ...) |
| Versioning      | semver                                                             |
| Release cadence | rolling; tag when a meaningful set of changes is shippable         |

## Code conventions

| Convention     | Source                                                  |
| -------------- | ------------------------------------------------------- |
| TypeScript     | strict mode (tsconfig) + eslint flat configs + prettier |
| Python         | ruff (lint + format)                                    |
| Rust           | rustfmt + clippy                                        |
| Go             | gofmt + go vet                                          |
| Comments       | only when WHY is non-obvious; no narrating WHAT         |
| File structure | colocate related code; avoid premature extraction       |
