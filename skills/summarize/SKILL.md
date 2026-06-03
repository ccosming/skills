---
name: summarize
description: >
  Consolidates one or more text blocks into a focused summary. Preserves
  attribution, flags contradictions, never introduces new claims. Returns
  summary + kept concepts + dropped concepts so the caller can audit.
when_to_use: >
  Invoked by other skills that need to compress multi-source output (e.g. N
  /research findings) into a single section ready to write into an artifact.
  Not user-invocable.
allowed-tools: Read
user-invocable: false
---

# Summarize

Compress one or more text blocks into a focused output. Never invent claims,
never add insights the inputs don't support.

## Inputs (caller passes inline)

- `texts` — one block of text, or a list of blocks (e.g. N /research outputs
  from different perspectives). Each block can optionally carry a `source`
  label.
- `focus` — what to keep front and center (e.g. `architectural implications`,
  `user pains`, `regulatory constraints`). Anything not relevant to `focus` is
  candidate for `dropped`.
- `max_length` — soft cap (e.g. `200 words`, `10 bullets`, `5 paragraphs`).
  Treat as soft: it is better to slightly exceed than to drop a load-bearing
  insight.
- `format` — one of: `prose` | `bullets` | `yaml`. Default: `bullets`.

## Process

1. **Read** every input block fully before composing.
2. **Tag** each insight by its source block when multiple inputs are passed
   (e.g. `[architect]`, `[ops]`).
3. **Cluster** insights by topic, not by source. The summary is organized by
   what, not by who.
4. **Flag contradictions** explicitly. If perspective A says X and perspective B
   says ¬X, both go in `summary` with `[disputed: A vs B]`.
5. **Drop** anything outside `focus`. Record what was dropped and why in
   `dropped`.

## Output

```yaml
summary: <the consolidated text in the requested format>
kept:
  - <key concept retained>
  - <key concept retained>
dropped:
  - concept: <what was dropped>
    reason:
      <out-of-focus | redundant | low-confidence | contradicted-and-weaker>
contradictions:
  - between: [<source-a>, <source-b>]
    about: <one-line description of the disagreement>
```

If there are no contradictions, omit the `contradictions:` key (do not include
with empty list).

## Rules

- **No new claims**. Every sentence in `summary` must be traceable to at least
  one input. If two inputs jointly support an inference, mark
  `[inferred from A+B]`.
- **Preserve attribution** when meaningful. Drop attribution only when the same
  point appears in multiple sources and identifying which one is no longer
  useful.
- **Length is a soft cap**. Exceed it before sacrificing a load-bearing insight.
  Note the overshoot in `dropped: []` if forced.
- **No file writes. No edits.** The caller stores the result.

## Failure modes

If the inputs are too thin to summarize, return:

```yaml
summary: INSUFFICIENT_INPUT
reason: <one of: empty-input | all-blocks-rejected | no-overlap-with-focus>
```
