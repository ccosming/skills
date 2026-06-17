---
name: ideate
description: >
  Turns a half-formed idea into a standalone concept whitepaper, interviewing one
  question at a time. Articulates what you want to build, why, how it could be
  solved, and the implementation options with their trade-offs — without
  specifying the product. Saves a self-contained whitepaper to a global ideas
  vault (~/.ccosming/ideas/) or the project's .ideas/. Can start from files you
  provide and enrich with /research. Use for "ideate", "brainstorm an idea",
  "help me articulate/think through X", "I have an idea". /spec can later seed a
  project's foundation from a closed whitepaper.
allowed-tools: Read Write Edit Bash AskUserQuestion Glob Grep Skill
argument-hint: '[idea]'
when_to_use: >
  User says "ideate", "brainstorm", "let's articulate/think through this idea",
  "I have an idea for X", "help me shape this idea", "continue/resume the
  ideation". Early, pre-product ideation that may or may not become a /spec
  project. The single ideation door.
---

# Ideate — articulate an idea into a concept whitepaper

Interview the user **one question at a time** about a half-formed idea until it
is articulated, then write a **standalone concept whitepaper**. The whitepaper is
the product: a document anyone can read on its own — no knowledge of `/spec` or
this plugin required. Many ideas never become a project; this skill stands alone.

## Altitude — articulate, don't specify

The whitepaper stays at **idea/strategy altitude**: what you want to build, why,
how it could be solved, and the implementation **options** with their trade-offs.
It **never** descends to product specification.

- **In scope:** the idea, the motivation, who it is for, rough solution shapes,
  the option space (with trade-offs), boundaries, open questions.
- **Out of scope — never produce these:** acceptance criteria, detailed
  requirements, schemas, module layouts, a *decided* stack or architecture. That
  precision is `/spec`'s job. The line is: **options and trade-offs here;
  decision and specification in `/spec`.**

When the user pushes into product detail, capture it as an option or an open
question and steer back to the idea level.

## Output: a standalone concept whitepaper

One self-contained file per session. Readable without any plugin context.
`/spec`-agnostic: no plugin jargon, no routing metadata, no artifact names. The
body follows this structure — **section headers stay in English** (like every
`.spec/` artifact); the prose follows `language.artifacts`:

```markdown
---
id: <slug | IDEATE-NNN>
doc: ideate-whitepaper
status: in-progress
topic: <one line>
lenses: [<lens-1>, ...]        # only if /research ran
open_questions:
  - 'Q1 — <first question>'
sources: []                     # filled if /research ran
---

# <Idea — working title>

**In one line:** <what you want to do, in a sentence.>

## What — the idea

<The concept: what you want to build.>

## Why

<The motivation / the problem or need. Who it is for.>

## How it could be solved

<One or more concept-level approaches. Render a flow as a Mermaid diagram when
shape helps. This is the space of how it could be approached, not THE design.>

## Implementation options

<The alternatives worth considering, each with trade-offs — nothing decided.
e.g. web vs mobile, native vs PWA, build vs buy, integration shapes. A short
table is good for comparing options.>

## Boundaries and non-goals

<What it deliberately is NOT / does not include.>

## Realities

<Budget, time, obligations, constraints — only if they came up.>

## Open questions

<What is still unresolved. Mirrors the frontmatter open_questions while the
session runs.>

## Appendix — exploration

<The question-and-answer trail, appended as the session runs. Optional reading.>
```

Section rules:

- **Open questions live in the frontmatter `open_questions` list** while the
  session runs (the cold-start contract); the body `## Open questions` mirrors
  what is still pending. When the list empties at close, neither lingers as noise.
- Omit a section with no content (e.g. `## Realities` if nothing came up) — never
  write "none" lines.
- Asides use a bold lead-in label or a `####` subsection; flows are Mermaid
  diagrams — see `../../references/interview-conduct.md` (_Formatting the working
  file_) and `../../references/diagrams.md`.

## Where it lives (dual-mode)

Two homes, by where the idea belongs:

- **Global vault (the default):** `~/.ccosming/ideas/<slug>.md` — your personal
  idea vault, portable across projects. Most early ideas are pre-project; they
  live here.
- **Project-level:** `<project>/.ideas/IDEATE-NNN-{slug}.md` — when you are
  ideating about *this* repository specifically.

Mode selection: **always ask** at the start (Step 1), whoever invoked (the user
directly, or `/spec` at its bootstrap fork) — `AskUserQuestion`: **Global vault
(Recommended)** | **This project**. The vault is **always** the recommended
option — ideas are portable and yours by default. Never flip the recommendation
to the project, not even when `/spec` invoked the skill inside a repo; the user
can still choose the project, but the skill does not steer them there.

Resolve `~` at runtime (`$HOME`); never hardcode an absolute home path.

## Interview conduct

Follow `../../references/interview-conduct.md` for the shared conduct: stance and
operational bias, two-phase questioning, the loop rules (walk `open_questions`
top-down, read before asking, write the whitepaper before the next question,
counter-questions first, no side effects), forked-helper invocation, and
working-file formatting. Cadence, language register, and the no-internal-scaffolding
rule are the constitution's (_Cadence_, _Localization_, _Voice_).

Ideate deltas:

- The working file is the **whitepaper**; update it before each new question.
- Language: when invoked by `/spec`, write the whitepaper in `language.artifacts`;
  standalone, match the user's language.
- `/research` is **opt-in** — use it when the idea benefits from current world
  facts (a fast-moving tool space, comparables, a niche standard, or the user asks
  to "research"); skip it for purely personal ideas. Capture results as `sources`.

## Starting from provided files (ingestion)

If the user points the session at files they hold (notes, markdown from prior
brainstorms, PDFs), read **only** those named files — never scan the tree or
sibling directories (Constitution, _Data boundary_). Distill them into the
relevant whitepaper sections as starting material the user confirms or steers,
and list them under `sources`. A file is raw material, not settled truth.

## Workflow

### 1. Resolve scope and check for resumable sessions

- **Ask the scope** (always, whoever invoked) — `AskUserQuestion`: **Global vault
  (Recommended)** | **This project**. The vault is **always** recommended (first
  option), even when `/spec` invoked the skill; never flip the recommendation to
  the project. The user may still pick the project.
- List in-progress whitepapers in the resolved home and offer to resume:

  ```bash
  ls ~/.ccosming/ideas/*.md 2>/dev/null; ls .ideas/IDEATE-*.md 2>/dev/null
  ```

  For each, read the frontmatter `status`; if any are `in-progress`, list them
  (topic, path, `open_questions` count) and ask whether to resume one or start
  fresh. On resume, read its `open_questions` and jump to Step 5.

**Exit:** scope locked (vault or project); a resume target or a fresh start.

### 2. Lock the idea and its motivation

- Confirm the idea in one sentence.
- Ask for the pains/objectives driving it (extract verbatim if they were in the
  prompt, and confirm).
- If the user provides files, read them now (see _Starting from provided files_)
  and reflect what you extracted for confirmation.

**Exit:** idea confirmed, motivation captured, provided files read.

### 3. Domain context and optional research

1. Name the idea's domain(s) from the topic + motivation.
2. Decide whether current external knowledge would sharpen the *how* / *options*
   (per `interview-conduct.md`, _Calling forked helpers_; `/research` is opt-in).
   If yes, pick 1-3 perspectives and issue `Skill(skill="research", ...)` calls
   together, then `/summarize` to consolidate.
3. Hold the consolidated knowledge and the source list for the file.

If no research is needed, proceed on intrinsic knowledge.

**Exit:** domain framed; research consolidated or explicitly skipped.

### 4. Initialize the whitepaper

Resolve the home, the next free id, and a UTC timestamp:

```bash
mkdir -p ~/.ccosming/ideas 2>/dev/null; mkdir -p .ideas 2>/dev/null; date -u +"%Y-%m-%dT%H:%M:%SZ"
```

Write the file (global: `~/.ccosming/ideas/<slug>.md`, `id: <slug>`; project:
`.ideas/IDEATE-NNN-{slug}.md`, `id: IDEATE-NNN`) using the skeleton in _Output_.
Seed the body sections with whatever Step 2-3 established; leave the rest as short
placeholders. Put `sources` in the frontmatter if research ran.

**Exit:** file exists; frontmatter, skeleton, and any seeded sections committed.

### 5. Walk the questions

Loop until `open_questions` is empty. Each iteration:

1. Pick the lowest-numbered open question.
2. Phase A (Q1-Q2) or phase B (Q3+) per the two-phase table in
   `interview-conduct.md`.
3. Pose it; if a provided file answers it, read instead of asking.
4. Get the answer (phase A: run `/clarify` first, present its question yourself;
   phase B: `/clarify` only on load-bearing ambiguity).
5. Update the file — two edits, in order:
   - **(a)** Fold the answer into the relevant whitepaper section(s), and append a
     one-block entry to `## Appendix — exploration`:

     ```markdown
     ### Q<n> — <short title>

     **Answer:** <the user's pick or prose, paraphrased; fold in any clarify
     resolution.>

     **So what:** 1-3 bullets — what this settles or opens for the idea.
     ```

   - **(b)** Update the frontmatter `open_questions` (remove the answered one,
     append any new child questions) and mirror it in the body `## Open questions`.

Keep every value-bearing answer at idea altitude (see _Altitude_); park product
detail as an option or an open question.

**Exit:** `open_questions` empty; every answer reflected in the whitepaper.

### 6. Synthesize and close

When `open_questions` is empty:

1. Finalize the whitepaper sections into a coherent read — group by idea, not by
   question. Render any flow as ` ```mermaid ```.
2. Remove the body `## Open questions` section (nothing pending).
3. Prune `lenses` that never paid off; note removals in one `## Notes` line if any.
4. Flip frontmatter `status: in-progress` → `status: closed`.

**Exit:** the whitepaper is self-contained; the appendix holds the trail.

### 7. Hand back

Summarize the idea in 5-10 lines (not the whole document). Then:

- **If invoked by `/spec`:** return — `/spec` offers to seed the project's
  foundation from this whitepaper.
- **If invoked directly:** `AskUserQuestion` for the next action (refine a
  section, start a `/spec` from this idea, write a follow-up, close). Never
  auto-execute.

**Exit:** the user has control of the next action.

## Constitution

Operate under the constitution injected at session start. If it is not in context,
read `../../references/constitution.md` before proceeding.
