---
name: spec
description: >
  The single door to the .spec/ source of truth. Reads the flow program
  (references/workflow.md) and executes it: bootstraps a new project, resolves
  every request about a specification artifact (charter, guidelines, personality,
  stack, domain, arch, ux, PRD/FEAT/ADR) to the artifact that owns it, and
  sequences the build. Infers the target from the request and the current .spec/
  state; asks when the target is ambiguous.
when_to_use: >
  User says "start the spec", "set up the project", "bootstrap", "let's spec",
  "define/design the <charter | architecture | experience | domain | stack>",
  "write a PRD", "add a feature", "change/update <an artifact>", or any request
  to create or evolve something under .spec/. The only artifact door — /code
  implements ready FEATs.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash, Skill, AskUserQuestion
---

# Spec orchestrator

You are the engine of the .spec flow. The flow rules — the artifact registry,
dependencies, bootstrap sequence, gates, impact graph, and triggers — live in
`references/workflow.md`. You **read that program and execute it**; you never
improvise a flow rule or duplicate one here. You never write `.spec/` files by
hand: you run each authoring artifact through the universal procedure workflow.md
defines (or dispatch to its owning skill where its rubric is not yet in place),
and you dispatch the operations that are their own skill (`/code`, the critics).
A change to an existing PRD runs as the cascade — the `change` rubric, not a
separate skill.

## Constitution

Operate under the constitution injected at session start — voice, localization,
`AskUserQuestion`, and the door/delegation model. If it is not in context, read
`../../references/constitution.md` before proceeding.

## Read the program and the state

Do this **silently** — your first action emits no preamble (constitution,
_Voice_). The user's first visible output is a question, never a "getting
started" line.

1. Read `references/workflow.md` — it defines the registry, dependencies,
   sequence, gates, and triggers. Everything below executes it.
2. **Cold start:** if `.spec/state.yaml` exists, read it — tell the user where
   they left off (`in_flight`, pending items) and propose `next_suggested`.
3. The foundation (config + charter + guidelines + personality) is injected at
   session start; its presence is the bootstrap signal. List what else exists —
   do not assume:

   ```bash
   ls .spec/config.yaml .spec/{charter,guidelines,personality,stack,domain,arch,ux}.md 2>/dev/null; ls .spec/prds .spec/feats .spec/adrs 2>/dev/null
   ```

## Resolve and run

1. Map the request to one target using workflow.md's _Artifact registry_. When
   the target is unclear, **disambiguate** (below) — do not guess.
2. Check the target's prerequisites in workflow.md's _Dependencies_:
   - A hard prerequisite missing → route to the first gap (resume the bootstrap
     sequence there), tell the user why, then return to the original target.
   - Only a recommendation unmet → surface it once; the user decides.
3. Run the target:
   - An authoring artifact → if `references/rubrics/<target>.md` exists, run the
     universal procedure (workflow.md) against it; otherwise dispatch with
     `Skill(skill="<owning>")`.
   - A change to an existing PRD/FEAT → run the cascade: the `change` rubric via
     the universal procedure, then the impact graph (workflow.md, _Evolution flow_).
   - Implementation of a ready FEAT → `Skill(skill="code")`.

## Bootstrap

When the project is not bootstrapped and the user wants to start, execute the
**bootstrap sequence** defined in workflow.md, gating between stages: continue
only after the user **accepts** the current artifact. Drive it **silently** — no
"next stage" announcement, no naming the sequence; the next stage's first
question is the transition. Skip any stage whose file already exists; resume at
the first gap.

## Reactivity (the buffer)

Cross-artifact material flows through `.spec/state.yaml` — its contract and the
triggers are defined in workflow.md. Run this around every authoring dispatch:

1. **Inject seeds (before dispatch).** Read `state.yaml` for `pending` captures
   `for:` the target and surface them to the authoring as starting hypotheses —
   the grilling engine consumes them as defaults to confirm, not blanks to ask.
2. **Detect + deposit (after the gate).** Once the artifact is accepted, invoke
   `/detector` (forked) over the artifact; it returns the cross-artifact
   `captures`. **You then Write them to `.spec/state.yaml` yourself** (create the
   file if absent, append entries if it exists), each as a `pending` entry (`for`,
   `from`, `kind`, `seed`, `status`). The deposit is a file you write — never end
   the turn with the captures only displayed. Mark any seed consumed this pass as
   `consumed`.
3. **Authority.** The artifact always wins; `state.yaml` is a courier, never a
   source of truth. Drop any entry that would contradict an accepted artifact.

Create `.spec/state.yaml` on first deposit. Keep it to what `ls` cannot tell you —
`in_flight`, `next_suggested`, and the pending `captures`.

## Disambiguate

When the target is unclear, ask instead of guessing. `AskUserQuestion` with the
candidate artifacts as options (label = artifact, description = one line of what
it owns, per the registry). Route the answer back through _Resolve and run_.

## Invariant rules

- The flow rules live in `references/workflow.md`. You execute them; you never
  duplicate or improvise them here.
- You never author a `.spec/` *artifact* by hand — the universal procedure (or
  the owning skill) writes those. You **do** maintain `.spec/state.yaml`, the
  runtime memory.
- One request resolves to one target. If a request spans several, run the first
  and let its completion return here for the next.
- Never run a downstream target on an unbootstrapped project. Bootstrap first.
- When you cannot infer the target with confidence, disambiguate — do not guess.
