# The specification bar

When a line in a `.spec/` artifact counts as **specified**. One source, two
enforcement points: the author applies it while authoring — per recorded fact
during grilling, plus a pre-write scan of the draft (the drafter on the stage-skill
path, the grilling engine inline) — and `/consistency` re-verifies it fresh-eyes
after the write. Every skill that writes or critiques artifacts treats this file as
binding.

## Scope

The bar binds **value-bearing lines** — statements a consumer acts on or
verifies: requirements, acceptance criteria, metrics, constraints, qualities,
scope boundaries, decisions. Narrative context (a problem story, a persona
sketch) is exempt unless it smuggles a commitment.

## The four tests

1. **Decidable** — a stranger could check it pass/fail without asking the
   author. "Search feels fast" fails; "results render in ≤200 ms at p95"
   passes.
2. **Bounded** — its scope is stated: which role, surface, subdomain, or case
   it covers — and what it excludes.
3. **Quantified or deferred** — every claim of degree carries a number, unit,
   or named scale; the only legal way to stay general is an **explicit
   deferral naming the downstream owner** ("directional here; threshold owned
   by the PRD"). A silent assumption is never recorded.
4. **Named** — actors and objects use the project's terms ("the editor
   publishes a draft"), never placeholders ("the system handles users
   properly").

## Recurring offenders

All rewritten or deferred before they reach an artifact:

| Category                          | Examples                                            |
| --------------------------------- | --------------------------------------------------- |
| Degree adjectives without a scale | fast, scalable, robust, simple, intuitive, seamless |
| Open-ended catch-alls             | etc., and so on, as needed, properly, gracefully    |
| Unanchored quantifiers            | some, several, many, most, various                  |
| Soft verbs in criteria            | handle, support, manage, ensure, deal with          |

## Legal forms

- A category label with a fit criterion attached: "reliability: a crashed run
  resumes without data loss". The bare label is not.
- An explicit deferral naming the downstream owner (test 3). The bar works
  *with* each rubric's altitude rules, not against them: a charter line stays
  directional via the deferral, never via a bare adjective.
