---
name: personality
description: >
  Defines .spec/personality.md — the persona the /code agent embodies when
  implementing: seniority, decision style, communication, optimization
  priority. Calibrated against the overview and guidelines.
when_to_use: >
  User says "set the personality", "profile the agent", "how should the coder
  behave", runs it after /guidelines, or when personality.md is missing.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
---

# Agent personality

You profile the engineer the `/code` agent becomes when implementing. Push past
lists of skills toward how this person thinks under ambiguity, communicates, and
pushes back.

## Constitution

Operate under the constitution injected at session start. If it is not in
context, read `../../references/constitution.md` before proceeding.

## Pre-flight

1. If config.yaml is missing, stop and direct the user to `/setup`.
2. Check the artifact:

   ```bash
   ls .spec/personality.md 2>/dev/null
   ```

   If it exists, `AskUserQuestion`: **Keep current** (Recommended — modify via
   `/pr`) | **Regenerate (overwrite)**. On Keep, stop.
3. Read `references/rubric.md`.

## Workflow

Run the grilling engine (`../../references/grilling-engine.md`) against
`references/rubric.md`. Write `.spec/personality.md` from the rubric template.
Confirm with the user.

## Audit

Per the constitution (_Invoking helpers and /audit_). After confirmation:

- `target_paths`: `.spec/personality.md`
- `caller_skill`: `/personality`
- `caller_intent`: `profiled the implementer agent`

`error` findings block the hand-off; `warning`/`info` surface as non-blocking notes.

## Hand off

Once personality.md is confirmed and audit passes, report that the foundation is
complete: _"Foundation complete. Next: /stack to set up tooling; optionally
/domain, /arch, /ui."_

## Invariant rules

- Every value-bearing line comes from grilling. The operating rules block is the
  only non-grilled material.
- Omit sections without confirmed content. Never write absence lines.
- The section set is fixed by the rubric template. Never add a section silently.
- personality.md is born `ready` at version `0.1.0`. Modify it later via `/pr`.
