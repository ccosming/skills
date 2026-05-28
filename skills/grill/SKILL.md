---
name: grill
description: Interviews the user one question at a time about a half-formed idea until a shared understanding emerges. Walks the design tree branch by branch, offers a recommended answer for every question, explores files before asking when an answer can be inferred, and captures notes in a markdown file the user picks at the start. Detects in-progress grill notes in the repo and offers to resume them before starting a new one. Use when the user has an idea or problem that is hard to articulate and needs help converting it into a concrete shared understanding before implementation.
allowed-tools: Read Write Edit Bash AskUserQuestion Glob Grep
disable-model-invocation: true
argument-hint: "[topic]"
when_to_use: User says "grill me", "interview me about X", "help me articulate Y", "let's figure out together what I want to do", "continue the grill", "resume the grill".
---

# /grill

Interview the user **one question at a time** about a half-formed idea until the design tree is fully resolved. Capture every turn in a markdown notes file. The grill is articulation, never implementation.

## Rules

- One question per turn. AskUserQuestion with 2-4 options; the runtime adds "Other" automatically.
- Every question carries a recommended answer with reasoning. Never ask blind.
- If a question can be answered by exploring the codebase, explore instead of asking.
- Walk the tree top-down. Resolve parent decisions before children.
- Update the notes file before posing the next question. Never batch. Each write must also refresh the `updated` frontmatter field with the current UTC timestamp.
- Match the user's language. When the user writes in Spanish, always use neutral Spanish: use "tú" or impersonal forms, never use voseo ("vos", "querés", "podés", "tenés", "sos") or Argentinian idioms ("che", "boludo", "laburar", "dale", "re-" as intensifier).
- Do not touch code, run destructive commands, or implement. Only read, ask, and write to the notes file.
- If the user asks a counter-question, answer it first, then continue.

## Workflow

### 1. Check for resumable grills

Before anything else, search the repo for existing grill notes:

```bash
grep -rln "^doc: grill-notes$" --include="*.md" . 2>/dev/null
```

For each match, read the frontmatter to confirm it is a notes file (skip skill source files) and check `status`. If any have `status: in-progress`, list them to the user (topic, path, last `updated` timestamp) and ask via AskUserQuestion whether to resume one or start a new grill. If resuming, jump to Step 4 using the existing file.

### 2. Lock the topic and notes path

- Confirm the topic in one sentence.
- Ask the user to list the pains or objectives driving the grill.
- Inspect the repo for an existing docs, notes, or specs directory. Offer 2-3 plausible paths for the notes file and mark the most fitting as `(Recommended)`. Default to `<cwd>/grill-<topic-slug>.md` if nothing matches. "Other" lets the user provide a custom path.

### 3. Initialize the notes file

Get the current UTC timestamp:

```bash
date -u +"%Y-%m-%dT%H:%M:%SZ"
```

Write the file with this skeleton (translate headings if the user is writing in another language; use the same UTC value for both `created` and `updated`):

```markdown
---
doc: grill-notes
status: in-progress
topic: <topic>
created: <UTC datetime, e.g. 2026-05-27T14:32:00Z>
updated: <same UTC datetime>
---

# Grill notes — <topic>

## Pains or objectives

<list from step 2>

## Resolved questions

(Filled as the grill progresses.)

## Open questions

- Q1 — <first question>
```

### 4. Walk the tree

Loop until no open questions remain:

1. Pick the next question top-down. If it can be answered by reading files, do that and record the answer directly in the notes.
2. Compose the question: brief framing + recommended answer with reasoning + AskUserQuestion with 2-4 options. Recommended option first, labeled `(Recommended)`.
3. On answer, update the notes file: move the question from `## Open questions` to `## Resolved questions` with the user's pick and its implications, then append any new child questions to `## Open questions`. Refresh the `updated` frontmatter field with the current UTC timestamp.
4. If the user picks "Other" with a counter-question, answer it first, then re-pose.

### 5. Synthesize

When the tree is resolved, append a `## Verdict` section consolidating decisions grouped by area, plus a `## Next steps` list ordered by dependency. Flip frontmatter `status: in-progress` to `status: closed` and refresh `updated`.

### 6. Hand back

Summarize the verdict briefly and ask the user what to do next. Do not auto-execute.
