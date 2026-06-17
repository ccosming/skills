# Guidelines template

The artifact template for the `guidelines` stage — loaded by the `drafting` subagent to transcribe the decision ledger into the artifact body, not during grilling.

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

<The three blocks below — baseline principles, commit discipline, security
baseline — are fixed (non-grilled). Render their prose in language.artifacts;
keep the bold canonical terms (CUPID, SOLID), the commit-type keywords, and
every `code` identifier verbatim in English.>

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
