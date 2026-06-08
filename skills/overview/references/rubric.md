# Overview rubric

Dimensions, coverage criteria, question seeds, and the artifact template.

## Dimensions

Partial order: `mission → roles → archetype → pillars → success-metrics →
{scope, constraints, context}` (last three interleave freely).

| Dimension         | Depends on      | Covered when                                                                               |
| ----------------- | --------------- | ------------------------------------------------------------------------------------------ |
| `mission`         | —               | active verb + object + end-to-end purpose present                                          |
| `roles`           | mission         | ≥1 primary role named (specific, not "users")                                              |
| `archetype`       | mission + roles | user picked from inferred top-3 or chose Other                                              |
| `pillars`         | archetype       | ≥1 named pillar (verb + object); qualitative, no metrics                                    |
| `success-metrics` | pillars         | ≥1 signal, ≥1 of them leading (traction/product); each tagged, directional, pillar-linked  |
| `scope`           | archetype       | user answered "none" OR ≥1 explicit exclusion                                              |
| `constraints`     | archetype       | user picked "No hard constraints" OR provided specifics for each picked option             |
| `context`         | archetype       | ≥1 archetype probe answered OR user explicitly said "no more"                              |

## Question seeds per dimension

The engine picks one seed based on the current gap. After every open answer, run
`/clarify` and apply the probes from the skill body.

### `mission`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| empty                                        | "What does this system DO end-to-end? Active verb mandatory."                       |
| has object, missing verb                     | "You described [object]. What verb captures what the system does to it?"            |
| has verb + object, missing purpose           | "[Verb] [object] — to what end?"                                                    |
| reads as feature list                        | "That reads like features. Compress to a single end-to-end sentence."               |

### `roles`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| empty                                        | "Who puts value INTO this system? Who receives value OUT?"                          |
| primary missing                              | "Who is the primary user — the one who actively interacts?"                         |
| served candidate not confirmed               | "Beyond the operator, is there an audience whose experience matters?"               |
| only one side mentioned                      | "You named [side]. The other side?"                                                 |

### `archetype`

| Gap         | Seed                                                                                       |
| ----------- | ------------------------------------------------------------------------------------------ |
| not asked   | AskUserQuestion with top-3 inferred + Other (see `archetypes.md` § Presentation)           |

### `pillars`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| empty                                        | "What does this product DO — name its core capabilities? Each as a verb + object, one line. (Numbers come later, in the PRD.)" |
| a pillar reads as a mechanism                | "That's a mechanism — name the end-to-end capability it serves."                    |
| set looks incomplete                         | "Is that the full set of what the product does, or is a capability still unnamed?"   |

Pillars are **named qualitative capabilities** (what the product does), not
metrics or implementation. If the user gives a number, a per-stage SLO, or a
mechanism, capture the capability here and defer the metric to `success-metrics`
(directional) and the precise target/mechanism to the PRD or `/arch`.

### `success-metrics`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| empty                                        | "What signals show each pillar is working? For each: traction (the pillar gets used), product (leading — user behavior/quality), or business (lagging — adoption/audience/revenue)? Give a direction and a rough horizon — the precise target goes in the PRD." |
| signal without a pillar                      | "[Signal] — which pillar measures it? Name it exactly as listed (one or more)."                                          |
| signal stated as a hard target               | "[Signal] at [number] — at overview level keep it directional (increase/reduce) with a rough horizon; the exact baseline→target and window belong in the PRD." |
| only lagging signals                         | "Those are lagging — they confirm after the fact. What leading signal (early user behavior) tracks [pillar]?" |

### `scope`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| not asked                                    | "What did you already decide is NOT part of this project? 'none' is valid — the section will be omitted." |

### `constraints`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| not asked                                    | "What hard constraints apply? Compliance, performance ceiling, deadline, vendor lock-in, budget?" |
| user blocked on open                         | AskUserQuestion multi-select: Compliance / Performance ceiling / Hard deadline / Vendor lock-in / Budget cap / No hard constraints |
| selected option without specifics            | "You picked [option] — what is the concrete value? (cap, date, vendor name)"        |

### `context`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| not asked, archetype known                   | First unanswered probe from `archetypes.md` for the chosen archetype                |
| more probes remaining                        | Next unanswered probe                                                               |
| archetype is "Other"                         | "What context matters that we haven't captured yet?"                                |
| user says "no more"                          | mark covered                                                                        |

## Branching cues

When the user's answer reveals content outside the current dimension:

| User signal                                          | Action                                                                  |
| ---------------------------------------------------- | ----------------------------------------------------------------------- |
| Mentions architectural component (frontend, service) | Park as context candidate; revisit at context phase                     |
| Mentions a past project as comparison                | Use as positioning signal for archetype inference                       |
| Mentions a constraint while answering other dim      | Pre-fill `constraints` evidence; revisit at constraints phase           |
| Mentions a metric while answering other dim          | Pre-fill `success-metrics`; revisit at that phase                       |

If content fits no dimension, ask: "Where does this live?" Show the dimension
list. Never invent a section.

## Template

````markdown
---
id: overview
status: ready
version: 0.1.0
prs: []
---

# Overview

## Mission

<One paragraph, max 2 sentences. Shape: [System name] [verb phrase] [object]
[purpose]. Example: "Hub captures research and notes as raw material and
transforms them into editorial content distributed across channels.">

## Users

<Each role: bold name + one-line description. Distinguish primary | served.
Skip "served" if only the operator exists.>

**[Role]** (primary | served): [how they engage with the system].

## Product pillars

<The qualitative capabilities the product commits to — its north stars. Each a
named capability (verb + object), one line; the source of truth a PRD later
elaborates into requirements and precise metrics. No numbers here.>

- **[Pillar]**: [what it does, end-to-end, in one line].

## Success metrics

<The handful of directional signals that show the product works. Each tagged by
altitude — traction (the pillar gets used), product (leading: user
behavior/quality), business (lagging: adoption/audience/revenue) — with a
direction and a rough horizon, linked to the pillar(s) it measures by their exact name — verbatim from Product
pillars, never a paraphrase or merged label. Precise
baseline → target and measurement window live in the PRD, not here. Omit the
section only if no measurable signal exists yet.>

| Signal       | Altitude                        | Direction                       | Horizon         | Pillar        |
| ------------ | ------------------------------- | ------------------------------- | --------------- | ------------- |
| [what moves] | traction \| product \| business | increase \| reduce \| establish | [rough horizon] | [pillar name] |

## Out of scope

<Only items the user explicitly excluded. Omit section if none.>

- **[Excluded item]**: [why excluded].

## Non-negotiable constraints

<Only constraints the user actively picked. Omit section if only "No hard
constraints" was selected.>

- **[Constraint type]**: [specific value or boundary].

## Context

<Sub-headers match the archetype probes from `archetypes.md`. Skip probes
without content. Omit section if no probes yielded content.>

### [Probe name]

<Free-form content from the user's answer.>

## Interaction notes

<Only when a user intervention changed the outcome. One line each, in
language.artifacts. Omit the whole section if there were none.>

## Changelog

| Timestamp (UTC)  | Version | Description                                                |
| ---------------- | ------- | ---------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | <Max ~100 chars. One phrase. The WHY of this version.>     |
````
