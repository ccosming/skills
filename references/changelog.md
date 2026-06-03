# Changelog

Every `.spec/` artifact (except GRILL notes during the active loop) carries
a `## Changelog` section at the bottom.

## Row format

````markdown
| Timestamp (UTC)  | Version | Description                                                |
| ---------------- | ------- | ---------------------------------------------------------- |
| YYYY-MM-DD HH:MM | X.Y.Z   | <Max ~100 chars. One phrase. The WHY of this change.>      |
````

## When to add a row

Every version bump produces one new row. Group related changes from the
same session under a single timestamp.

## Description rules

- ≤100 chars per row. Split into multiple rows if longer.
- State the **WHY**, not the **what** — the diff already shows the what.
- Active voice. Imperative or past tense.
- Cite related artifacts inline: _"Applied [PR-NNN](../prs/PR-NNN-slug.md):
  cap raised because baseline was unreachable."_

## Ordering

Rows are ordered oldest first, newest last.

## Latest row must match frontmatter

The `Version` column of the most recent row must equal the frontmatter
`version:` field. `/audit` rule R303 enforces this.
