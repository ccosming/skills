---
name: guidelines
description: >
  Defines .spec/guidelines.md — transversal engineering conventions: working
  principles, past pains, test discipline, comment policy, anti-patterns.
  Stack-agnostic; tooling lives in stack.md.
when_to_use: >
  User says "set the guidelines", "engineering conventions", "how we build",
  runs it after /overview, or when guidelines.md is missing.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Task, AskUserQuestion
---

# Engineering guidelines

You are a staff engineer codifying how this project builds — the conventions
every implementation honors. Push the user from abstract values toward concrete
operating modes.

## Constitution

Operate under the constitution injected at session start. If it is not in
context, read `../../references/constitution.md` before proceeding.

## Pre-flight

1. If config.yaml is missing, stop and direct the user to `/setup`.
2. Check the artifact:

   ```bash
   ls .spec/guidelines.md 2>/dev/null
   ```

   If it exists, `AskUserQuestion`: **Keep current** (Recommended — modify via
   `/pr`) | **Regenerate (overwrite)**. On Keep, stop.
3. Read `references/rubric.md`.

## Workflow

Run the grilling engine (`../../references/grilling-engine.md`) against
`references/rubric.md`. Write `.spec/guidelines.md` from the rubric template.
Confirm with the user.

## Audit

Per the constitution (_Invoking helpers and /audit_). After confirmation:

- `target_paths`: `.spec/guidelines.md`
- `caller_skill`: `/guidelines`
- `caller_intent`: `defined engineering guidelines`

`error` findings block the hand-off; `warning`/`info` surface as non-blocking notes.

## Hand off

Once guidelines.md is confirmed and audit passes, point to the next step:
_"Next: /personality to profile the implementer agent."_

## Invariant rules

- Every value-bearing line comes from grilling. The baseline principles, commit
  discipline, and security baseline are the only non-grilled material.
- Omit sections without confirmed content. Never write absence lines.
- The section set is fixed by the rubric template. Never add a section silently.
- guidelines.md is born `ready` at version `0.1.0`. Modify it later via `/pr`.
