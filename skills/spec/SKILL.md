---
name: spec
description: >
  The single door to the .spec/ source of truth. Bootstraps a new project and
  routes every request about a specification artifact (overview, guidelines,
  personality, stack, domain, arch, ux, PRD/FEAT) to the skill that owns it, or
  to a change proposal for an existing PRD. Infers the target from the request
  and the current .spec/ state; asks when the target is ambiguous.
when_to_use: >
  User says "start the spec", "set up the project", "bootstrap", "let's spec",
  "define/design the <overview | architecture | experience | domain | stack>",
  "write a PRD", "add a feature", "change/update <an artifact>", or any request
  to create or evolve something under .spec/. The only artifact door — /code
  implements ready FEATs, /issue triages problems.
allowed-tools: Read, Glob, Grep, Bash, Skill, AskUserQuestion
---

# Spec router

You route the user to the skill that owns the artifact they want to create or
evolve. You never write `.spec/` files yourself — you dispatch. Each owning skill
handles its own create-vs-modify decision; your job is to pick the right one, in
the right order, and to ask when the target is unclear.

## Constitution

Operate under the constitution injected at session start — voice, localization,
`AskUserQuestion`, and the door/delegation model. If it is not in context, read
`../../references/constitution.md` before proceeding.

## Read the state

1. The foundation (config languages + overview, guidelines, personality) is
   injected at session start. Treat its presence as the bootstrap signal: all
   three present → the project is bootstrapped.
2. List what else exists — do not assume:

   ```bash
   ls .spec/config.yaml .spec/{overview,guidelines,personality,stack,domain,arch,ux}.md 2>/dev/null; ls .spec/prds .spec/feats 2>/dev/null
   ```

## Infer the target

Map the request to one target. The owning skill, not you, decides whether to
create fresh or modify.

| The user is about… | Target | Owning skill |
| --- | --- | --- |
| starting the project, languages | bootstrap | sequence below |
| what the system does, vision, scope | overview | `/overview` |
| engineering conventions, standards | guidelines | `/guidelines` |
| the implementer agent's persona | personality | `/personality` |
| tooling, framework, deps, structure | stack | `/stack` |
| ubiquitous language, glossary, entities | domain | `/domain` |
| components, boundaries, technical architecture | arch | `/arch` |
| experience, UX/UI, interactions, flows | ux | `/ux` |
| a new product capability / requirement | PRD/FEAT | `/prd` |
| changing an existing PRD or its FEATs | PR cascade | `/pr` |

Invoke the chosen skill with `Skill(skill="<name>")`. For a PRD change, pass the
target: `Skill(skill="pr", args="target: PRD-NNN")`.

## Dependencies

Before dispatching, verify the target's prerequisites. "Foundation" =
config + overview + guidelines + personality.

| Target | Requires — block, route there first | Recommends — note, don't block |
| --- | --- | --- |
| overview | config | — |
| guidelines | config + overview | — |
| personality | config + overview + guidelines | — |
| domain | foundation | — |
| arch | foundation | — |
| ux | foundation | — |
| stack | foundation | arch — define the architecture before its tooling |
| PRD (new) | foundation | domain, arch, ux — so derived FEATs inherit them |
| PR (change) | the target PRD exists and is not `in-progress` | — |

A missing hard prerequisite routes to that prerequisite first — resume the
bootstrap sequence at the gap, then return to the original target. A missing
recommendation is surfaced once; the user decides whether to take it first.

## Route

1. Target is "bootstrap" (or an unscoped "start the project") → run the bootstrap
   sequence below.
2. Otherwise check the target's row in _Dependencies_:
   - A hard prerequisite is missing → route to the first missing prerequisite,
     resuming the bootstrap sequence at the gap. Tell the user why.
   - Only a recommendation is unmet → surface it once as a non-blocking note; let
     the user proceed or take it first.
3. Target ready:
   - New or regenerated artifact → `Skill(skill="<owning>")`.
   - Change to an existing PRD/FEAT → `Skill(skill="pr", args="target: <ID>")`.
   - Ambiguous target → disambiguate (below) before dispatching.

## Bootstrap sequence

You own this order. Run it when the project is not bootstrapped and the user
wants to start. Invoke each stage with `Skill(...)`. Continue to the next stage
only after the user **accepts** the current artifact (the confirmation gate).
Drive it **silently** — no "next stage" announcement, no naming the sequence; the
next stage's first question is the transition.

1. `Skill(skill="setup")` — languages → `.spec/config.yaml`.
2. `Skill(skill="overview")` — what the system is.
3. `Skill(skill="guidelines")` — engineering conventions.
4. `Skill(skill="personality")` — the implementer agent's persona.
5. Foundation complete. Surface the optional next stages and let the user pick or
   stop: `/stack` (tooling), `/domain` (ubiquitous language), `/arch`
   (architecture), `/ux` (experience), `/prd` (first capability). Route the pick
   through this same router.

If `config.yaml` already exists, skip step 1. If a later foundation file already
exists, skip its step. Resume the sequence at the first missing stage.

## Disambiguate

When the target is unclear, this is the escape hatch — ask instead of guessing.
`AskUserQuestion` with the candidate artifacts as options (label = artifact,
description = one line of what it owns). Route the answer back through _Infer the
target_.

## Invariant rules

- You never create or edit `.spec/` files. You route; the owning skill writes.
- One request routes to one owning skill. If a request spans several artifacts,
  dispatch the first and let its completion return here for the next.
- Never invoke a downstream skill on an unbootstrapped project. Bootstrap first.
- Modifying an existing PRD (and its FEAT cascade) goes to `/pr`. Modifying any
  other artifact goes to its owning skill, which offers keep-or-regenerate.
- When you cannot infer the target with confidence, disambiguate — do not guess.
