# Cross-references

`.spec/` artifacts link to each other via markdown links and frontmatter
arrays.

## Markdown link format

Always use:

````markdown
[ID slug](../{type}s/ID-slug.md)
````

Examples:

- `[PRD-007 search-engine](../prds/PRD-007-search-engine.md)`
- `[ADR-003 ranking-algo](../adrs/ADR-003-ranking-algo.md)`
- `[FEAT-005 indexer-pipeline](../feats/FEAT-005-indexer-pipeline.md)`

The path is relative from `.spec/<type>s/` to the linked artifact's folder.

## Frontmatter arrays

Cross-references also live in frontmatter as arrays of IDs:

| Field         | Used by             | Contents                                    |
| ------------- | ------------------- | ------------------------------------------- |
| `prs`         | All artifacts       | PRs that touched this artifact              |
| `adrs`        | PRD, FEAT, stack    | ADRs that constrain this artifact           |
| `feats`       | PRD, ADR            | FEATs derived from this PRD/ADR             |
| `prds`        | ADR                 | PRDs this ADR serves                        |
| `prd`         | FEAT                | Parent PRD                                  |
| `depends_on`  | FEAT                | FEATs that must be `done` before starting   |
| `reviews`     | FEAT                | REVs that audited this FEAT                 |
| `target`      | REV, PR             | The single FEAT (REV) or PRD (PR) targeted  |
| `affects`     | PR                  | All artifacts touched by the PR cascade     |

## Bidirectionality

If artifact A lists B in its array, B should list A back (or be A's
declared target). `/audit` rule R107 flags one-sided references as
warnings.
