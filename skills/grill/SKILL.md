---
name: grill
description: Interviews the user one question at a time about a half-formed idea until a shared understanding emerges. Runs in one of three profiles chosen at the start — `discovery` (flows, rules, scope — the what/why), `technical` (architecture, stack, schemas — the how, presupposing a settled discovery), or `full` (both layers). First establishes domain context (optionally via /research subagents under multiple perspectives, consolidated with /summarize), then walks the design tree starting with open exploratory questions and switching to AskUserQuestion with recommended answers as context accumulates. Resolves polysemic terms via /clarify on the fly. Captures every turn into `.grills/<topic-slug>.md`. Detects in-progress notes and offers to resume. Use when the user has an idea or problem that is hard to articulate and needs help converting it into a concrete shared understanding before implementation.
allowed-tools: Read Write Edit Bash AskUserQuestion Glob Grep Task
disable-model-invocation: true
argument-hint: "[topic]"
when_to_use: User says "grill me", "interview me about X", "help me articulate Y", "let's figure out together what I want to do", "continue the grill", "resume the grill".
---

# /grill

Interview the user **one question at a time** about a half-formed idea until the design tree is fully resolved. Capture every turn in a markdown notes file under `.grills/`. The grill is articulation, never implementation.

## Core goals

- **Cold-start resilience**: if the session dies mid-grill, the notes file alone must let a fresh invocation pick up exactly where it stopped. The frontmatter (`status`, `profile`, `open_questions`) + `## Domain context` are the cold-start contract.
- **Shared understanding**: by the end, the user can read the verdict and confirm "yes, that is what I meant" without needing the conversation transcript.
- **Lens transparency**: the perspectives the grill adopts are written into the notes file, so the user and future sessions know from where the questioning is coming.

## Operational bias

Apply to every turn. These shape voice and depth, not just the rules below:

- **Bias toward narrowing scope**. Push the user to define less, deeper. Resist branch expansion. Free-text questions are open, not diffuse.
- **Reuse what exists**. If a pattern, decision, or artifact is already in the repo, surface it before asking the user to redefine it.
- **Peer-reviewer brevity**. Every sentence that can be removed gets removed. Match the economy of a senior engineer reviewing a teammate.

## Rules

- One question per turn.
- If a question can be answered by exploring the codebase, explore instead of asking.
- Walk the tree top-down. Resolve questions in the order they appear in the frontmatter `open_questions` list. Never skip ahead to a child before its parent is resolved.
- Update the notes file before posing the next question. Never batch. Each write must refresh the `updated` frontmatter field with the current UTC timestamp.
- Zero filler. State the question (or framing + recommendation) directly. End-of-turn summary: one sentence maximum.
- Match the user's language. When the user writes in Spanish, always use neutral Spanish: use "tú" or impersonal forms, never use voseo ("vos", "querés", "podés", "tenés", "sos") or Argentinian idioms ("che", "boludo", "laburar", "dale", "re-" as intensifier).
- Do not touch code, run destructive commands, or implement. Only read, ask, and write to the notes file.
- If the user asks a counter-question, answer it first, then continue with the next tree question.

### Formatting of the notes file

- **No blockquotes.** Never use Markdown `>` for callouts, asides, or emphasis. Use a bold lead-in label (e.g. `**Tensión transversal:** ...`) or a `####` subsection instead.
- **Flows are diagrams, not ASCII.** Whenever you define a flow, render it inside a ```` ```mermaid ```` block: a `flowchart` for a user/process flow, a `sequenceDiagram` for interactions between actors or components. Never hand-draw a flow with ASCII boxes/arrows.

## Calling other skills — always via Task subagents

**The Skill tool does not return control.** When you invoke `Skill(...)` directly, the model adopts that skill and ends the turn after producing its output — it does **not** resume this workflow. So every helper skill the grill needs a result from is invoked inside a **`Task` subagent**, which runs the skill in isolation and returns its output to you as a tool result. When the Task returns, you are back in this workflow and continue.

Emit the literal `Task(...)` call (these are tool calls, not suggestions):

- **Clarify** — analysis-only; returns a spec, then **you** present the question:
  ```
  Task(subagent_type="general-purpose", description="clarify term",
       prompt="Invoke the clarify skill: Skill(skill=\"clarify\", args=\"user_input: <reply>; domain_context: <...>; prior_resolutions: <n>; written_sections: <n>\"). Return ONLY its YAML output (status: NO_POLYSEMY, or a NEEDS_DISAMBIGUATION spec). Do not ask the user anything.")
  ```
- **Summarize**:
  ```
  Task(subagent_type="general-purpose", description="summarize research",
       prompt="Invoke the summarize skill: Skill(skill=\"summarize\", args=\"texts: <blocks>; focus: <...>; max_length: <...>; format: bullets\"). Return ONLY its YAML output.")
  ```
- **Research** — one Task per perspective, up to 3 in parallel in a single message:
  ```
  Task(subagent_type="general-purpose", description="research <perspective>",
       prompt="Invoke the research skill: Skill(skill=\"research\", args=\"question: <...>; perspective: <...>\"). Return ONLY its YAML output.")
  ```

After a Task returns, continue the workflow yourself: present the clarify question, write the summary into the notes file, etc. If you describe a call but do not emit the `Task(...)`, you have failed the step.

## Profiles

Every grill runs in one profile, locked in Step 2 and recorded in frontmatter as `profile:`. A resumed grill keeps its profile. The profiles map to layers: `discovery` = the *what/why*, `technical` = the *how*, `full` = both.

**Note:** `technical` means the **technical / implementation layer** (architecture, stack, schemas, data, ops) — **not** visual or UX design.

| | `discovery` | `technical` | `full` |
|---|---|---|---|
| Layer | what / why | how | both |
| Goal | flows, rules, invariants, scope, success criteria | architecture, stack, schemas, module layout, technical decisions | everything in `discovery` then `technical` |
| Lenses allowed | product-strategy, domain-expert, end-user, process, compliance | architect, ops, security, data, performance, cost | any of the above |
| Presupposes | nothing | a settled discovery (imports a prior closed `discovery` grill, or a short domain summary from the user) | nothing |
| Grills implementation? | **No** — park it | **Yes**, exclusively | Yes |
| Grills the what/why? | Yes | **No** — it is assumed settled; park domain revisions | Yes |
| Verdict shape | flow definition + rules catalog + conceptual domain model + scope matrix + success criteria | implementation inventory (stack tables, schemas, module/file layout, architecture decisions, what-stays-vs-goes) | both verdicts, discovery then technical |

A closed `discovery` grill is the clean input to a later `technical` grill — discovery before design.

When recommending the profile in Step 2: **default to `discovery`** (start with the what/why). Recommend `technical` when a closed `discovery` grill for this topic already exists, or the user signals the domain is settled and they want to design the build. Recommend `full` when the user wants both layers in one sitting.

## Two-phase questioning

| Phase | When | Form |
|---|---|---|
| **A — Free-text exploratory** | Q1 and Q2 only | Open question, no AskUserQuestion, no options. Read the user's prose, then run clarify via `Task` (see `## Calling other skills`). If it returns a disambiguation spec, present that question yourself before recording. |
| **B — Recommended options** | Q3 onward | 1-3 lines of framing + recommended answer with reasoning + `AskUserQuestion` with 2-4 options. Recommended option labeled `(Recommended)`, first in the list. |

Hard limits: at most 2 free-text questions in a row. After Q2 the grill must switch to phase B regardless of context confidence.

In phase B, run clarify via `Task` only when a reply or counter-question introduces a load-bearing ambiguous term. Otherwise skip — phase B picks already disambiguate.

## File structure invariants

Guard these every write — structure rot is the most common failure:

- **Open questions live in the frontmatter**, as the YAML list `open_questions`, never as a body section. This keeps the closed document clean (no empty "Open questions" heading lingering after the grill ends).
- **Answered questions live only under `## Resolved questions`**, as full `### Q<n>` blocks, in ascending Q-number order. There is **exactly one** `## Resolved questions` heading — never create a second.
- During the grilling loop, `## Resolved questions` is the **last section in the file**. That is what makes "append to the end of the file" land a new block in the right place.
- `## Decisions made` and `## Suggested next steps` **do not exist during the loop**. They are created once, in Step 6, appended after `## Resolved questions`.

## Pre-flights

Run before the first user-facing turn. Abort with `state: aborted  reason: <reason>` if any check fails:

1. **Topic is intelligible**. If the user invoked `/grill` with no topic, ask `What topic do you want to grill?` before continuing.
2. **At least one pain or open question exists**. If the user cannot articulate any, the grill is premature — suggest writing the idea freeform first.
3. **`.grills/` is usable**. The skill can create the directory at the repo root and write into it.

## Workflow

### 1. Check for resumable grills

Look in `.grills/` for existing notes:

```bash
ls .grills/*.md 2>/dev/null
```

For each file, read the frontmatter and check `status`. If any have `status: in-progress`, list them to the user (topic, path, last `updated` timestamp, count of `open_questions`) and ask via AskUserQuestion whether to resume one or start a new grill. If resuming, read its `open_questions` from the frontmatter and jump to Step 5 using the existing file.

**Exit**: either a resume target is locked, or the user chose to start fresh.

### 2. Lock the topic, pains, and profile

- Confirm the topic in one sentence.
- Ask the user to list 3-10 pains or objectives driving the grill. If they appeared in the original prompt, extract them verbatim and confirm.
- **Select the profile** (always ask — see `## Profiles`). Emit `AskUserQuestion` with three options — `discovery`, `technical`, `full` — the inferred recommendation first and labeled `(Recommended)`. Infer per the rule in `## Profiles` (default `discovery`).
- The notes file path is fixed: `.grills/<topic-slug>.md`. Do not ask the user where to save.

**Exit**: topic confirmed, pains captured, profile locked, target path is `.grills/<topic-slug>.md`.

### 3. Establish domain context

Goal: name the lenses the grill will adopt and seed domain knowledge that the questioning depends on.

**If profile is `technical`**: do not re-establish the domain from scratch. First look for a closed `discovery` grill on this topic in `.grills/`; if found, read its verdict and import it into the Domain context section (mark it `imported from <path>`). If none exists, ask the user for a 2-3 sentence domain summary, or suggest running `discovery` first. Then pick technical lenses and continue.

1. **Identify the domain(s)** at play from the topic + pains.
2. **Pick 2-5 perspectives** relevant to the domain, **restricted by profile** (see `## Profiles`): `discovery` → product-strategy, domain-expert, end-user, process, compliance only; `technical` → architect, ops, security, data, performance, cost only; `full` → any of those. Cap at 5.
3. **Decide per perspective**: does this lens need external research, or is intrinsic model knowledge sufficient? Criteria for research:
   - Rapidly changing area (current tooling, library best practices, regulatory updates).
   - Domain niche the model has weak coverage on (specific industry practices, narrow standards).
   - User explicitly asked for "research" or "investigate" in the topic.
4. **If research is needed** for 1-N perspectives, emit up to 3 `Task(...)` calls in a single message (parallel). Use the template from `## Calling other skills`. One call per perspective.
5. **Consolidate**. Run summarize via `Task` (see `## Calling other skills`) with `texts:` the research outputs, `focus: domain expertise relevant to <topic>, organized by lens`, `max_length: 10 bullets + 1 short paragraph per lens`, `format: bullets`. When the Task returns, hold its output.
6. **Hold the result in memory**. It goes into the notes file in Step 4.

If no research is needed and you can ground the lenses from intrinsic knowledge alone, skip steps 4-5 and write the Domain context directly: lenses + 2-3 key concepts per lens + `research: skipped (intrinsic knowledge sufficient)`.

**Exit**: domain lenses chosen, key concepts captured, research consolidated (or explicitly skipped).

### 4. Initialize the notes file

Ensure the directory exists and get the current UTC timestamp:

```bash
mkdir -p .grills && date -u +"%Y-%m-%dT%H:%M:%SZ"
```

Write the file to `.grills/<topic-slug>.md` with this **exact skeleton and section order** (translate headings if the user is writing in another language; use the same UTC value for both `created` and `updated`):

```markdown
---
doc: grill-notes
status: in-progress
profile: <discovery | technical | full>
topic: <topic>
created: <UTC datetime, e.g. 2026-05-27T14:32:00Z>
updated: <same UTC datetime>
lenses: [<perspective-1>, <perspective-2>, ...]
open_questions:
  - "Q1 — <first question>"
---

# <topic>

Live notes captured during the grill. The goal is to articulate **what we want to do** before landing on a solution.

## Pains or objectives declared at start

<numbered list from step 2>

## Domain context

**Lenses adopted**: <comma-separated from step 3>

**Key concepts per lens**:
- **<lens 1>**: <2-3 lines of context, key terms, current state>
- **<lens 2>**: ...

**Research findings**: <the summarize output; or "skipped: intrinsic knowledge sufficient">

**Sources** (only when /research ran):
- [<title>](<url>) — accessed <UTC>

## Resolved questions

_(none yet)_
```

Section order rules:
- **Open questions go in the frontmatter `open_questions` list, not the body.** Each entry is a quoted string `"Q<n> — <question>"`. When the list empties at close, nothing lingers in the document.
- **Do not include a parking-lot section in the skeleton.** It is created lazily in Step 5 only when the user volunteers an off-layer detail: in `discovery`, a `## Parking lot — implementation`; in `technical`, a `## Parking lot — domain revisions`. An empty parking lot is noise; no section until there is something to park.
- `## Resolved questions` is the **last section** during the loop — that is what makes "append to end of file" land correctly. (A parking lot, if created, sits above it.)

**Exit**: file exists; frontmatter, skeleton, and Domain context committed.

### 5. Walk the tree

Loop until the frontmatter `open_questions` list is empty.

Each iteration:

1. **Pick the lowest-numbered question** in `open_questions`.
2. **Decide phase**: Q1 or Q2 → phase A (free-text). Q3+ → phase B (recommended options).
3. **Pose the question** per the phase format. If it can be answered by reading a file or a quick exploratory command, do that instead of asking.

   **Profile guardrails** (park off-layer detail instead of grilling it; create the parking-lot section lazily on first use by inserting it **immediately before `## Resolved questions`**, then append a one-line bullet):
   - **`discovery`**: do not ask, recommend, or record implementation choices (frameworks, languages, libraries, schemas, deploy, vendors). If the user volunteers one, park it under `## Parking lot — implementation` (intro: "Implementation details deferred to a future `technical` grill") and steer back to flow / rules / scope. Stay at what and why, not how.
   - **`technical`**: do not re-grill the what/why; the domain is assumed settled. If the user reopens scope, flows, or goals, park it under `## Parking lot — domain revisions` (intro: "Domain changes to reconcile in a `discovery` pass") and steer back to architecture / stack / decisions. Stay at the how.
   - **`full`**: no guardrail — both layers are in scope.
4. **Get the answer**.
   - **Phase A**: read the user's prose, then run clarify via `Task` (template in `## Calling other skills`, passing `user_input`, `domain_context`, `prior_resolutions`, `written_sections`). When the Task returns you are back here:
     - `status: NO_POLYSEMY` → proceed to record.
     - `status: NEEDS_DISAMBIGUATION` → present the returned `question` to the user **yourself**: AskUserQuestion with the returned `options` when `mode: options`; a plain question when `mode: free-text`. When the user answers, fold the resolution into the recorded Answer, then record.

     This clarify Task is mandatory in phase A. Clarify never asks the user — you do.
   - **Phase B**: run clarify via `Task` only when a load-bearing ambiguous term appears, and present its `question` the same way. Otherwise skip.
   - If the user picks "Other" with a counter-question, answer it first, then re-pose if still open.
5. **Update the notes file** — two edits, in this order:

   **(a) Append the resolved block to the END of the file.** During the loop the last section is `## Resolved questions`, so the new block lands there in ascending order. Use exactly:

   ```markdown
   ### Q<n> — <short title>
   **Answer**: <user's pick or prose, paraphrased; fold in any clarify resolution>

   **Implications**: 3-7 bullets of concrete consequences for the system / project / decision. Each bullet must be actionable or load-bearing. Whenever the link exists, cross-reference back to a declared pain (e.g. "presses dolor #2"), a lens (e.g. "[architect lens]"), or another resolved question (e.g. "extends Q3"). Use a sub-table inside the implications when comparing options or summarizing trade-offs.
   ```

   **(b) Update the frontmatter `open_questions` list.** Remove the entry for the question you just answered, and append any new child questions as quoted entries (`"Q<n> — <question>"`). Then refresh the `updated` field. Never write open questions into the body.

If a question is trivial or has an obvious canonical answer from the repo, record it directly from the observed evidence — do not ask.

**Exit**: `open_questions` is empty; every question is a block under `## Resolved questions`.

### 6. Synthesize

Only when `open_questions` is empty. Append to the **end of the file**, after `## Resolved questions`:

1. `## Decisions made` with a `### Integrated verdict` subsection. **Group by area, not by Q-number.** Render any flow as a ```` ```mermaid ```` diagram (see Formatting rules), never ASCII. For asides like deferrals or cross-cutting tensions, use a `#### <label>` subsection — never a `>` blockquote. Shape the verdict by profile (see `## Profiles`):
   - `discovery`: flow definition (Mermaid `flowchart` or `sequenceDiagram`) + rules/invariants catalog + conceptual domain model (entities and relationships, not schemas) + scope matrix (in/out) + success criteria. No stack, no implementation. If `## Parking lot — implementation` has items, add a `#### Deferred to technical` subsection noting them.
   - `technical`: implementation inventory — stack tables, schemas, module/file layout, architecture decisions (Mermaid diagrams for any flow/sequence), what-stays-vs-what-goes. Use tables for comparisons. If `## Parking lot — domain revisions` has items, add a `#### Needs a discovery pass` subsection noting them.
   - `full`: the `discovery` verdict followed by the `technical` verdict.
2. `## Suggested next steps` with concrete actions ordered by dependency.
3. **Prune unused lenses**. For each lens in `## Domain context`, verify it appears in at least one resolved question's implications. Remove any lens that never paid off; note the removal in a one-line `## Notes` entry at the bottom.
4. Flip frontmatter `status: in-progress` to `status: closed` and refresh `updated`.

**Exit**: notes file is self-contained; verdict at the end; lenses cleaned.

### 7. Hand back

Summarize the verdict briefly (5-10 lines max, not the whole document) and ask the user what to do next via AskUserQuestion (typical: implement step X, refine decision Y, write a follow-up doc, close). Do not auto-execute the next step.

**Exit**: user has control of the next action.

## Skill orchestration cheatsheet

All three run inside a `Task` subagent (the Skill tool does not return control — see `## Calling other skills`). Each subagent invokes the skill and returns its YAML; you then continue.

| Skill | Invoked when | Call |
|---|---|---|
| `research` | Step 3, when a perspective needs external knowledge | `Task(...)` invoking `Skill(skill="research", ...)` — up to 3 in one message |
| `summarize` | Step 3, to consolidate research (or intrinsic notes) | `Task(...)` invoking `Skill(skill="summarize", ...)` |
| `clarify` | Step 5: mandatory every phase-A turn; phase-B only on load-bearing ambiguity | `Task(...)` invoking `Skill(skill="clarify", ...)` → returns a spec; **you** present the `question` |

All three return structured outputs the grill writes into the notes file. None of them write to files directly.
