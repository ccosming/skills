---
name: research
description: Performs focused research on a single question from one perspective. Combines WebSearch, WebFetch and local repo grep, returns a structured findings block (summary, insights, sources, implications) for the caller to store. Use when another skill needs domain expertise it cannot infer from context. Designed to be invoked inside a Task subagent so research context stays isolated from the caller.
allowed-tools: WebSearch WebFetch Read Grep Bash
user-invocable: false
---

# Research

Perform focused research on a single question from one perspective. Return a structured findings block. Never write to any file — the caller decides where to store the output.

## Inputs (caller passes inline in the Task prompt)

- `question` — the specific question to investigate. Single question, not a topic. Composite questions → reject, ask caller to split.
- `perspective` — the lens to adopt (e.g. `architect`, `end-user`, `ops`, `security`, `legal`, `product-strategy`). Stay in this lens throughout. The same question from a different perspective is a different call.
- `source_policy` (optional) — preferred source types. Default: official docs > recent technical writing > academic. Reject content farms, AI-generated SEO pages, and listicles.
- `date_policy` (optional) — recency filter (e.g. `last 12 months only`). Default: no filter; prefer recent when material is fast-moving.

## Process

1. **Plan** 2-4 search queries derived from `question` + `perspective`. State them at the top of your output as a `searches:` list.
2. **Search** with WebSearch. Pick 3-5 most promising results, biased by `source_policy`.
3. **Fetch** with WebFetch. Skip dead links and unreadable pages.
4. **Cross-check** with local repo via Grep when the question touches code, patterns, or domain language already present.
5. **Synthesize** from the chosen perspective. Cite sources by URL. Mark uncertainty with `(unverified)`, `(inferred)`, or `(low confidence)`.

## Output

Return exactly this block as your final message. No preamble, no closing remarks:

```yaml
perspective: <perspective>
searches:
  - <query 1>
  - <query 2>
summary: |
  1-3 paragraphs from the chosen perspective. State what is known, what is contested, and what is unknown.
insights:
  - <load-bearing insight 1>
  - <load-bearing insight 2>
sources:
  - title: <title>
    url: <url>
    accessed: <UTC datetime via `date -u +"%Y-%m-%dT%H:%M:%SZ"`>
implications:
  - <implication for the caller's decision context>
```

## Rules

- **One question per invocation**. Composite questions → reject with `summary: REJECTED  reason: composite-question, split into <list>`.
- **Stay in the declared perspective**. Do not produce balanced multi-perspective output — that is the orchestrator's job.
- **No fabricated sources, stats, or quotes**. If a claim has no source, mark it `(unverified)`. If you cannot verify, do not include the claim.
- **No file writes. No edits.** The caller stores results.
- **Skip blocked content** (paywalls, login walls). Note it in `sources` with `accessed: blocked`.

## Failure modes

If the question is unresearchable, return:

```yaml
summary: UNRESEARCHABLE
reason: <one of: too-vague | no-web-sources | behind-paywall | out-of-scope-of-tools>
suggestion: <what the caller could ask instead>
```
