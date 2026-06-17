---
name: clarify
description: >
  Analyzes input for the single most load-bearing polysemic term and returns
  a disambiguation spec (term, question, options) for the caller — or
  NO_POLYSEMY. Caller-agnostic: never talks to the user, never writes files;
  control returns to the caller in the same turn.
when_to_use: >
  Invoked by other skills when they need to disambiguate a word before
  composing content or recording a decision. Not user-invocable.
allowed-tools: Read
user-invocable: false
context: fork
---

# Clarify

Analyze the caller's input, find the single most load-bearing polysemic term
that is not already resolved, and return a **disambiguation spec** the caller
can present to its own user.

You run as a forked helper (constitution, _Invoking helpers and /audit_): a pure
analysis step that never talks to the user and never writes files — your returned
spec is the result, and the caller owns all interaction.

## Inputs (caller passes inline)

- `user_input` — the text the caller plans to act on.
- `domain_context` (optional) — short paragraph on the domain; narrows polysemy.
- `prior_resolutions` (optional) — count of terms already resolved this session.
- `prior_resolutions_list` (optional) — `{term, resolution}` pairs already
  settled; skip these.
- `written_sections` (optional) — count of non-empty sections in the caller's
  artifact; used to recommend mode.
- `artifact_path` (optional) — path to read for
  skip-list checking only. **Never write to it.**

## Skip-list

A term needs no clarification when one holds:

- It appears in `prior_resolutions_list`.
- The caller's artifact already defines it (read `artifact_path` if provided).
- Every plausible reading of `user_input` resolves to the same concept.

Implicit context — surrounding wording, "what the term obviously means" — does
**not** resolve a term. Flag it when unsure.

## Polysemy dimensions

Reason about each candidate along these dimensions:

- User-facing concept vs internal concept.
- Data structure vs UI element vs process step.
- Category or taxonomy vs visual styling.
- Domain entity vs sort or sequence.
- Manual action vs automated pipeline.
- Owner vs operator vs contributor.
- Container vs contained item.
- Long-form vs short-form; text vs multimedia; single-channel vs multi-channel.
- Broad collective noun vs specific instance.

The list orients the scan; it is not a fixed vocabulary.

## Procedure

1. Enumerate polysemic candidates in `user_input` not covered by the skip-list.
2. If none → return `status: NO_POLYSEMY`.
3. Else pick the **first by order of appearance** and build a spec for that one
   only.

## Recommend a mode

| Signal                                             | mode        |
| -------------------------------------------------- | ----------- |
| `prior_resolutions ≤ 1` AND `written_sections < 2` | `free-text` |
| `prior_resolutions ≥ 2` OR `written_sections ≥ 2`  | `options`   |

When uncertain, recommend `free-text`. Reading the user's prose teaches more
than ranking weak options.

## Build the spec

- **free-text**: compose one open question naming the term and the dimension(s)
  at stake. No options.
- **options**: compose the question plus 2-4 disambiguation options. Option
  rules:
  1. Mutually exclusive — no containment. Reject drafts where one option is a
     subset of another.
  2. Distinct by kind, not by degree (`few X` vs `many X` is invalid).
  3. Concrete noun phrase, 3-6 words. No abstract labels (`Sense A`,
     `Meaning 1`).
  4. Order by prompt-context match — strongest first.
  5. Each option names a meaning or dimension, never a specific instance.

## Output — return to the caller, no user interaction

Polysemy found:

```yaml
status: NEEDS_DISAMBIGUATION
term: <the term>
dimension: <axis of ambiguity>
mode: <free-text | options>
question: <the exact question for the caller to ask its user>
options: # include only when mode is options
  - <option 1>
  - <option 2>
```

No polysemy:

```yaml
status: NO_POLYSEMY
```

## Hard rules

- **One term per invocation.** The caller invokes clarify again next turn if
  more remain.
- **Never call AskUserQuestion, address the user, or write files** — forked helper
  contract (constitution, _Invoking helpers and /audit_). Analyze and return a spec.
- **Do not resolve the term by guessing.** Return the spec; the caller asks and
  records.
- Match the caller's language for `question` / `options`; neutral register
  (constitution, _Localization_).
