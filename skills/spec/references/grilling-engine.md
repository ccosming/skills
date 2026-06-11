# Grilling engine

A dimension-coverage loop run by `/spec` (the universal authoring procedure in
`workflow.md`) against a **rubric bundle** (`rubrics/<artifact>.md`: persona +
dimensions + coverage criteria + question seeds + branching cues + template).
This engine consumes the bundle; it never invents sections.

The engine's product is a contract: an artifact precise enough that a stranger
— or `/code` — acts on it without asking its author anything. Precision is the
engine's job, not the user's: when the user arrives vague, the loop extracts
the missing precision dimension by dimension, and what stays general stays
general explicitly, with a named downstream owner. Every recorded fact and
every written line clears _The bar_ below.

## Stance — lead, don't interrogate

The calling skill is a **domain expert** (its persona), not a pollster. Grilling
draws out the user's vision **and** brings the skill's craft to it. For any gap
with a craftable answer — a metric, target, benchmark, option set, or default —
**lead with a recommended proposal the user confirms or adjusts**; never hand the
user a blank to fill from scratch when you can propose one. When the skill's own
expertise is too thin to propose credibly (an unfamiliar benchmark or domain
norm), invoke `/research` (see _/research invocation_) to earn the default, then
propose.

Hold the line between **craft** and **vision**: the skill proposes the craft (how
to express it — metrics, targets, structure); the user owns the vision (what to
build and why) — never substitute it. Open, optionless prose is only for genuinely
divergent framing the user must author; everything craftable is led, not asked
blank.

## The bar — when a line is specified

Every fact recorded as evidence and every value-bearing line written into an
artifact passes four tests:

1. **Decidable** — a stranger could check it pass/fail without asking the
   author. "Search feels fast" fails; "results render in ≤200 ms at p95"
   passes.
2. **Bounded** — its scope is stated: which role, surface, subdomain, or case
   it covers — and what it excludes.
3. **Quantified or deferred** — every claim of degree carries a number, unit,
   or named scale; the only legal way to stay general is an **explicit
   deferral naming the downstream owner** ("directional here; threshold owned
   by the PRD"). A silent assumption is never recorded.
4. **Named** — actors and objects use the project's terms ("the editor
   publishes a draft"), never placeholders ("the system handles users
   properly").

A line that fails a test is re-grilled with one focused question, or rewritten
as an explicit deferral — at the dimension that owns it. The recurring
offenders, all rewritten or deferred before they reach an artifact:

| Category                          | Examples                                          |
| --------------------------------- | ------------------------------------------------- |
| Degree adjectives without a scale | fast, scalable, robust, simple, intuitive, seamless |
| Open-ended catch-alls             | etc., and so on, as needed, properly, gracefully  |
| Unanchored quantifiers            | some, several, many, most, various                |
| Soft verbs in criteria            | handle, support, manage, ensure, deal with        |

A category label with a fit criterion attached is legal ("reliability: a
crashed run resumes without data loss"); the bare label is not. The bar works
*with* each rubric's altitude rules, not against them: a charter line stays
directional **via test 3's deferral**, never via a bare adjective.

## Provenance and the decision ledger

Every recorded fact carries exactly one provenance tag:

| Tag         | Meaning                                                        |
| ----------- | -------------------------------------------------------------- |
| `stated`    | The user said it.                                              |
| `confirmed` | An inference the user explicitly accepted.                     |
| `default`   | A recommended proposal accepted as-is.                         |
| `deferred`  | Left general on purpose; the owning downstream artifact named. |

The **decision ledger** is the per-dimension roll-up handed to the confirmation
gate: one line per dimension — the decision and its tag. `confirmed` and
`default` lines are called out at the gate for the user to veto. A fact that
fits no tag was never gated: gate it (`AskUserQuestion`) before the ledger
closes.

## Seeds

The orchestrator may surface **seeds** — starting hypotheses for a dimension,
captured earlier in the project (e.g., domain detail that came up while authoring
the charter). Treat a seed exactly like the skill's own craft proposal: a
recommended default to confirm or steer, never a settled fact and never a blank
handed back. When a dimension has a seed, lead its proposal with it; with no seed,
proceed from the skill's own expertise. A seed the user rejects is dropped, not
re-proposed.

## Loop

```text
Load dimensions, seeds, branching cues, template from the rubric.
evidence = {}

while not all required dimensions covered:
  available = dimensions whose deps are satisfied
  next_dim  = available with lowest coverage; ties resolve in the rubric's
              table order
  gap       = identify the gap from the dimension's coverage criteria
  seed      = the rubric's seed for (next_dim, gap), verbatim or minimally
              adapted; improvise only when no seed matches the gap

  # Disambiguate before interpreting: loop /clarify over the user-supplied
  # material this gap rests on until NO_POLYSEMY (see /clarify invocation);
  # ground the proposal on each resolved reading, or expose the rival readings
  # as the options.

  proposal  = the skill's expert default for this gap (persona craft; /research
              when its own knowledge is thin; or the orchestrator's seed for this
              dimension, if one was surfaced) — for any craftable gap
  ask       = lead with the proposal (prose, recommendation-first), then gate it
              with a single AskUserQuestion — Accept / Adjust (+ options) — so the
              user approves in one click or steers. Proposal is content; the
              question is short but self-contained (the decision + gist, not the
              rationale). Optionless prose only for divergent framing (Stance)
  answer    = ask the user

  if the answer is open text (a free reply or an AskUserQuestion "Other"):
    run /clarify on it (per the constitution)
    apply the calling skill's probes (if it defines any)
    set depth from materiality (see Depth)
    if material: present 2-3 framings, or challenge a weak/contradictory answer
    gate every material inference/proposal via AskUserQuestion (Accept / Adjust),
    not an open prose "confirm?"

  evidence[next_dim] += extracted facts, each tagged with its provenance —
    stated | confirmed | default | deferred (see Provenance). Gate an untagged
    inference via AskUserQuestion before recording it.
  a dimension closes when its coverage criteria hold AND its facts clear The bar
  detect branching
  detect unreadiness

draft the artifact from the template
scan the draft against The bar: re-grill (one focused question) or rewrite as
  an explicit deferral every line that fails; write only at zero failures
write the artifact, recording stance-changing interventions in its
  ## Interaction notes (per the constitution)
run the consistency pass (mandatory — see Consistency); resolve every
  contradiction with the user before the gate
hand the decision ledger to the confirmation gate (the orchestrator's step —
  workflow.md; constitution _Confirming artifacts_)
```

## Depth (adaptive)

Per the constitution (_Grilling depth_), operationalized here:

| Signal in the answer / decision | Depth |
| --- | --- |
| Contested (several viable approaches), irreversible, high blast-radius (architecture, data, contracts) | Full: present 2–3 framings; have the user react; record the trade-off |
| Vague, short, underspecified | Probe until concrete |
| Contradicts prior evidence (charter constraints, an earlier dimension) | Challenge it openly before recording |
| Trivial, clear, well-specified, low-impact | Confirm the inference and move on |

**Floor — every material dimension, before advancing:** apply the skill's probes,
surface ≥1 inference as "Inferred: [X]. Confirm?", and — if it is contested or
high-impact — present 2–3 framings. One question per turn (cadence), so depth is
many focused single-question turns, never several questions stacked into one. A
material dimension closed on its first answer, unprobed, is **not covered**.
Default to challenge on material points, light on the rest; never record a
material assumption silently.

## Branching

When an answer reveals content that belongs to another dimension, **park it and
move on — do not solve it inline.** Pulling a neighboring dimension's decision
into the current one is what turns a focused question into an overwhelming
multi-dimension derivation. Parking is scoped to **neighboring** dimensions only —
it never licenses closing the **current** dimension shallowly: park the neighbor,
then keep grilling the current one to its depth floor.

1. Acknowledge it in one line ("noted — we'll set that when we reach
   constraints") and record it as evidence for that dimension; revisit it when
   that dimension comes up.
2. A **constraint** surfaced mid-grilling (budget, hours, deadline, ceiling) is
   parked for the `constraints` dimension, never reconciled against the current
   one. A **metric** surfaced mid-grilling is parked for `success-metrics` (or
   named as a `functional requirement` if it is actually a capability).
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
  (b) Continue and document the gaps for the change flow to resolve
  (c) Scope down — this may belong in /grill first"
```

On (a), close without writing the artifact. On (b), continue and mark the
uncovered dimensions in the changelog row. On (c), stop and recommend `/grill`.

## /clarify invocation

Per the constitution (_Invoking helpers and /audit_). Run /clarify on any
user-supplied material you are about to interpret — the initial seed, an open
answer, a free-text adjustment — **before** a proposal or recorded fact commits to
one reading of it. Never wait for an "open answer": a load-bearing term in the
seed is disambiguated before the anchor is built on it. Pass:

- `user_input`: the term or reply being interpreted.
- `domain_context`: `<artifact> grilling, dimension <name>`.
- `prior_resolutions`: count of disambiguations already resolved this session.
- `written_sections`: count of sections already written.

If `NEEDS_DISAMBIGUATION` returns, present the spec's `question` via
`AskUserQuestion` yourself, fold the resolution into the proposal or recorded
answer, then proceed.

## /research invocation

When a credible proposal needs knowledge the skill lacks — a benchmark, market
norm, realistic range, or comparable — invoke `/research` (forked, per the
constitution) **before** asking, then lead with the grounded default:

```text
Skill(skill="research", args="question: <single specific unknown>; perspective: <lens, e.g. product-strategy>")
```

Fold the returned `summary`/`insights` into a recommended default and cite the
basis in one phrase. Do not offload to the user a number the skill could research;
reserve the open ask for what only the user can answer (their vision, their
constraints).

## Consistency

Critique and the gate are the orchestrator's steps (workflow.md 7–8); the engine
only feeds them. What is yours here:

- **Coupled dimensions** — a target that depends on a constraint (e.g. cadence =
  hours ÷ effort) — are reconciled against the assembled whole, once, not
  improvised mid-grilling. Park neighbors per _Branching_; when the orchestrator's
  consistency pass surfaces the tension, resolve it by re-grilling the affected
  dimensions in one focused exchange.
- This pass catches **contradictions**, never **omissions** — depth is guaranteed
  during the loop (see _Depth_), never deferred to it.

## On Adjust

When the gate returns **Adjust**, ask which dimension, re-run the loop narrowed to
that one only, rewrite, and refresh the ledger — then hand back to the gate.
