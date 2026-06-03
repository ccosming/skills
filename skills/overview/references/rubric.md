# Overview rubric

Dimensions, coverage criteria, question seeds, and the artifact template.

## Dimensions

Partial order: `mission → roles → archetype → capabilities → outcomes →
{scope, constraints, context}` (last three interleave freely).

| Dimension      | Depends on        | Covered when                                                                          |
| -------------- | ----------------- | ------------------------------------------------------------------------------------- |
| `mission`      | —                 | active verb + object + end-to-end purpose present                                     |
| `roles`        | mission           | ≥1 primary role named (specific, not "users")                                         |
| `archetype`    | mission + roles   | user picked from inferred top-3 or chose Other                                        |
| `capabilities` | archetype         | ≥1 `output` row AND ≥1 `quality` row, each with target + window                       |
| `outcomes`     | capabilities      | each outcome row lists ≥1 capability metric in `enabled_by`                           |
| `scope`        | archetype         | user answered "none" OR ≥1 explicit exclusion                                         |
| `constraints`  | archetype         | user picked "No hard constraints" OR provided specifics for each picked option        |
| `context`      | archetype         | ≥1 archetype probe answered OR user explicitly said "no more"                         |

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

### `capabilities`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| empty                                        | "What is the software committed to producing (output cadence) AND what quality bars must it meet (perf, UX, accessibility)?" |
| only `output` rows                           | "Output covered. What quality standards must the system meet to be acceptable?"     |
| only `quality` rows                          | "Quality covered. What does the system produce and at what cadence?"                |
| row missing window                           | "[Metric] — over what window? (per week / month / always)"                          |

### `outcomes`

| Gap                                          | Seed                                                                                |
| -------------------------------------------- | ----------------------------------------------------------------------------------- |
| empty                                        | "What outcomes do you expect from operating this software? Indirect goals — business, audience, adoption. For each, which capability enables it?" |
| outcome without `enabled_by`                 | "[Outcome] — which capability in your table enables this? If none, either add the capability or move this to a note acknowledging external dependency." |
| outcome without `external_factors`           | "[Outcome] depends partly on factors outside the software. List them."              |

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
| Mentions a metric while answering other dim          | Pre-fill `capabilities` or `outcomes`; revisit at that phase            |

If content fits no dimension, ask: "Where does this live?" Show the dimension
list. Never invent a section.

## Template

````markdown
---
id: overview
title: <project name> — System overview
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

## Capabilities

<≥1 `output` row AND ≥1 `quality` row.>

| Type    | Metric              | Baseline | Target          | Window    |
| ------- | ------------------- | -------- | --------------- | --------- |
| output  | [what is produced]  | [today]  | [target volume] | [cadence] |
| quality | [standard]          | [today]  | [target value]  | [scope]   |

## Outcomes

<Each row lists ≥1 capability metric in `Enabled by`. If no capability
supports an outcome, either add the capability or move the outcome to a note
acknowledging external dependency.>

| Metric    | Baseline | Target   | Window   | Enabled by             | External factors          |
| --------- | -------- | -------- | -------- | ---------------------- | ------------------------- |
| [outcome] | [today]  | [target] | [window] | [capability metric(s)] | [non-software factors]    |

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

## Changelog

| Timestamp (UTC)  | Version | Description                                                |
| ---------------- | ------- | ---------------------------------------------------------- |
| YYYY-MM-DD HH:MM | 0.1.0   | <Max ~100 chars. One phrase. The WHY of this version.>     |
````
