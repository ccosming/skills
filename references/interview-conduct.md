# Interview conduct

Shared conduct for the **free-form interview skills** — `/ideate` and `/grill` —
which interview the user one question at a time toward a written artifact (a concept
whitepaper, grill notes). They run interactively in the main loop (never forked).
This reference holds what is common to both; each skill keeps only its own artifact,
altitude, and workflow.

Rubric-backed authoring does **not** use this file — it runs `grilling-engine.md`, a
different loop (dimension coverage, not free-form questioning). Everything here
operates under the constitution (injected at session start); where a rule is the
constitution's, this file points rather than restates.

## Stance — lead, don't interrogate

Bring the skill's craft to the user's vision; do not just collect answers.

- **Narrow, don't diffuse.** Push the user to define less, deeper. Resist branch
  expansion. A free-text question is open, not vague.
- **Reuse what exists.** If a repo pattern, a provided file, or a prior artifact
  already answers something, surface it instead of re-asking.
- **Peer brevity.** Every removable sentence goes; match a senior reviewer's
  economy. The end-of-turn summary is one line.

Lead with a recommended proposal the user confirms or adjusts — never a blank when
you can propose (constitution, _Lead with a proposal, not a blank_). Reserve an
optionless, open question for genuinely divergent framing the user must author.

## Two-phase questioning

| Phase | When | Form |
| --- | --- | --- |
| **A — Free-text** | Q1 and Q2 only | Open question, no options. Read the prose, then run `/clarify`; if it returns a disambiguation, present that question yourself before recording. |
| **B — Recommended options** | Q3 onward | 1-3 lines of framing + a recommended answer with reasoning + `AskUserQuestion` (2-4 options, Recommended first — constitution, _Asking the user_). |

At most 2 free-text questions in a row; after Q2, switch to phase B regardless of
confidence. In phase B run `/clarify` only when a reply introduces a load-bearing
ambiguous term — phase-B picks already disambiguate.

Cadence is the constitution's (_Cadence_): one question per turn, and a multi-part
question counts as several. Phase A's open question is the divergent-framing
exception the constitution carves out — not a license to bundle facets into one
turn.

## Loop rules

- **Walk questions top-down.** Resolve the frontmatter `open_questions` in order,
  lowest-numbered first; never skip a parent for a child.
- **Read before asking.** If a question is answerable by reading a named file or a
  quick exploratory command, do that instead of asking.
- **Write before advancing.** Update the working file (whitepaper / notes) *before*
  posing the next question; never batch several answers into one write.
- **Counter-questions first.** If the user asks one, answer it, then continue.
- **No side effects.** Never touch code, run destructive commands, or implement —
  only read, ask, and write the working file.

Match the user's language; neutral register, and no internal scaffolding (question
indices, mechanism names) in the visible turn (constitution, _Localization_ and
_Voice_).

## Calling forked helpers

`/clarify`, `/research`, `/summarize` are forked helpers (`context: fork`). Invoke
each **directly** with `Skill(...)` — never wrap one in `Task` (a nested fork
fails); each returns its YAML and you continue (constitution, _Invoking helpers and
/audit_). Emit the literal call — describing it without emitting it is a failed
step.

- **Clarify** — analysis-only; it returns a spec and **you** present the question:

  ```
  Skill(skill="clarify", args="user_input: <reply>; domain_context: <...>; prior_resolutions: <n>; written_sections: <n>")
  ```

- **Research** — one call per perspective, issued together when you need several:

  ```
  Skill(skill="research", args="question: <single unknown>; perspective: <lens>")
  ```

- **Summarize** — consolidate multi-source output before writing it in:

  ```
  Skill(skill="summarize", args="texts: <blocks>; focus: <...>; max_length: <...>; format: bullets")
  ```

## Formatting the working file

- **No blockquotes.** Use a bold lead-in label or a `####` subsection for asides,
  never Markdown `>`.
- **Flows are diagrams, not ASCII.** Render any flow in a ` ```mermaid ` block per
  `diagrams.md` (no theme/init block; break labels with `<br/>`, never `\n`).
