# Grilling engine

A dimension-coverage loop used by the rubric-driven skills — `/overview`,
`/guidelines`, `/personality`, `/arch`, `/ux` — each of which ships a
`references/rubric.md`. Other grilling skills (`/prd`, `/domain`, `/stack`,
`/pr`) run bespoke workflows and do not consume this engine; they still obey the
constitution's grilling principles. The calling skill passes a rubric
(`references/rubric.md`) that defines the dimensions, coverage criteria, question
seeds, branching cues, and the artifact template. This engine consumes them; it
never invents sections.

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
    run /clarify (per the constitution)
    apply the calling skill's probes (if it defines any)
    set depth from materiality (see Depth)
    if material: present 2-3 framings, or challenge a weak/contradictory answer
    surface every material inference for confirmation — emit "Inferred: [X]. Confirm?"

  evidence[next_dim] += extracted facts
  detect branching
  detect unreadiness

write the artifact from the template, recording stance-changing interventions
  in its ## Interaction notes (per the constitution)
run the consistency pass (mandatory — see Consistency); resolve every
  contradiction with the user before the gate
run the confirmation gate (mandatory — see Confirmation)
```

## Depth (adaptive)

Per the constitution (_Grilling depth_), operationalized here:

| Signal in the answer / decision | Depth |
| --- | --- |
| Contested (several viable approaches), irreversible, high blast-radius (architecture, data, contracts) | Full: present 2–3 framings; have the user react; record the trade-off |
| Vague, short, underspecified | Probe until concrete |
| Contradicts prior evidence (overview constraints, an earlier dimension) | Challenge it openly before recording |
| Trivial, clear, well-specified, low-impact | Confirm the inference and move on |

Default to challenge on material points, light on the rest. Confirming a material
inference is mandatory; never record a material assumption silently.

## Branching

When an answer reveals content that belongs to another dimension, **park it and
move on — do not solve it inline.** Pulling a neighboring dimension's decision
into the current one is what turns a focused question into an overwhelming
multi-dimension derivation.

1. Acknowledge it in one line ("noted — we'll set that when we reach
   constraints") and record it as evidence for that dimension; revisit it when
   that dimension comes up.
2. A **constraint** surfaced mid-grilling (budget, hours, deadline, ceiling) is
   parked for the `constraints` dimension, never reconciled against the current
   one. A **metric** surfaced mid-grilling is parked for `capabilities` or
   `outcomes`.
3. If no dimension fits, ask "Where does this live?" and show the rubric's
   dimension list.
4. Sections come from the template only. Never add one silently.

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

## Consistency

After writing and before the gate (per the constitution, _Artifact
self-consistency_):

1. Run the critic: `Skill(skill="consistency", args="target_path: <path>;
   caller_skill: <name>")`.
2. For each contradiction it returns, surface the critic's `question` to the user
   (one at a time — cadence), resolve it by re-grilling the affected dimension,
   and rewrite the artifact.
3. Re-run until it returns `consistent` — or the user explicitly overrides a
   finding.

**Coupled dimensions** — a target that depends on a constraint (e.g. cadence =
hours ÷ effort) — are reconciled **here**, once, against the assembled whole, not
improvised mid-grilling. Capture each dimension as it comes (parking neighbors per
_Branching_); let the consistency pass surface the tension between them and
resolve it in one focused exchange.

## Confirmation

The mandatory gate (per the constitution, _Confirming artifacts_). Nothing
advances — no return to `/spec`, no chaining, no next stage — until the user
accepts.

After writing the artifact (and after `/audit` passes):

1. Summarize: one bullet per dimension — value or "omitted".
2. `AskUserQuestion`: **Accept** (Recommended) | **Adjust**.

On Adjust, ask which dimension, re-run the loop narrowed to that dimension only,
re-write, and re-confirm.
