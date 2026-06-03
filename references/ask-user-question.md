# AskUserQuestion

Use `AskUserQuestion` for closed-domain choices (yes/no, pick-one,
multi-select from a known taxonomy). For open exploration, ask in plain
prose.

## Option format

- 2–4 options per question.
- The recommended option is the **first** in the list and carries
  `**(Recommended)**` in its label.
- Each option has a clear, mutually exclusive meaning.
- Never include an "Other" option in the list — Claude Code adds it
  automatically.

## Multi-question turns

One `AskUserQuestion` call can carry multiple questions in a single turn
(rendered as tabs). Use this when the questions are independent and the
user can answer them in any order.

## Recommended-first reasoning

Mark an option `(Recommended)` only when the engine has a defensible
default based on prior evidence. Without strong evidence, present options
without a recommendation rather than guess.

## Open-first principle

Open free-text is the default for grilling. Reach for `AskUserQuestion`
when:

- The dimension has a closed taxonomy (e.g., test discipline modes).
- The user signaled they need options ("no sé", "qué opciones hay").
- The decision is binary or single-pick with stable alternatives.
