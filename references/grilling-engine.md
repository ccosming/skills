# Grilling engine

A dimension-coverage loop shared by the foundation skills (`/overview`,
`/guidelines`, `/personality`, and any skill that grills toward a fixed
template). The calling skill passes a rubric (`references/rubric.md`) that
defines the dimensions, coverage criteria, question seeds, branching cues, and
the artifact template. This engine consumes them; it never invents sections.

## Loop

```text
Load dimensions, seeds, branching cues, template from the rubric.
evidence = {}

while not all required dimensions covered:
  available = dimensions whose deps are satisfied
  next_dim  = available with lowest coverage
  gap       = identify the gap from the dimension's coverage criteria
  seed      = pick the seed for (next_dim, gap) from the rubric
  question  = formulate the seed in language.chat, customized to current evidence
  answer    = ask the user

  if open answer:
    run /clarify via Task
    apply the calling skill's probes (if it defines any)
    surface inferences for confirmation — emit "Inferred: [X]. Confirm?"

  evidence[next_dim] += extracted facts
  detect branching
  detect unreadiness

write the artifact from the template
confirm with the user
```

## Branching

When an answer reveals content outside the current dimension:

1. Fit it into an existing dimension (park it; revisit when that dimension comes up).
2. If no dimension fits, ask the user "Where does this live?" and show the
   rubric's dimension list.
3. Sections come from the template only. Never add one silently.

## Readiness check

Count consecutive turns matching any signal:

- `/clarify` returns `NEEDS_DISAMBIGUATION`
- The answer is under 10 words and contains no verb
- The answer contradicts evidence from a prior dimension

At 3, pause and ask:

```text
"I detected: [signals from the last 3 turns]. Three paths:
  (a) Break and resume later when it is clearer  [Recommended if vocabulary is unstable]
  (b) Continue and document the gaps for /pr to resolve
  (c) Scope down — this may belong in /grill first"
```

On (a), close without writing the artifact. On (b), continue and mark the
uncovered dimensions in the changelog row. On (c), stop and recommend `/grill`.

## /clarify invocation

Per the constitution (_Invoking helpers and /audit_). For every open answer pass:

- `user_input`: the user's reply.
- `domain_context`: `<artifact> grilling, dimension <name>`.
- `prior_resolutions`: count of disambiguations already resolved this session.
- `written_sections`: count of sections already written.

If `NEEDS_DISAMBIGUATION` returns, present the spec's `question` via
`AskUserQuestion` yourself, fold the resolution into the recorded answer, then
proceed.

## Confirmation

After writing the artifact:

1. Summarize: one bullet per dimension — value or "omitted".
2. `AskUserQuestion`: **Accept** (Recommended) | **Adjust**.

On Adjust, ask which dimension, re-run the loop narrowed to that dimension only,
re-write, and re-confirm.
